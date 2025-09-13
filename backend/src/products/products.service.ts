import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // adjust path if needed
import { CreateProductDto } from './dto/create-product.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class ProductsService {
   private aiApiUrl: string;
   private readonly embeddingApiUrl: string;
   private readonly translateApiUrl:string;
   private readonly searchApiUrl:string;

   constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.aiApiUrl = this.configService.get<string>('AI_API_URL', 'http://mini-inventory-alb-511512394.us-east-1.elb.amazonaws.com/items/assign_category');
    this.embeddingApiUrl= this.configService.get<string>('embedding_URL','http://mini-inventory-alb-511512394.us-east-1.elb.amazonaws.com/items/embedding');
    this.translateApiUrl=this.configService.get<string>('translate_URL','http://mini-inventory-alb-511512394.us-east-1.elb.amazonaws.com/items/translate');
    this.searchApiUrl=this.configService.get<string>('search_URL','http://mini-inventory-alb-511512394.us-east-1.elb.amazonaws.com/items/search');

  }

  async create(dto: CreateProductDto) {
    dto.inStock = dto.quantity > 0;

    let productWithCategory = await this.prisma.product.create({
      data: {
        name: dto.name,
        category: dto.category ?? '',
        price: dto.price,
        quantity: dto.quantity,
        inStock: dto.inStock,
     
        description: dto.description ?? null, 
      },
    });

    
    if (!dto.category || dto.category.trim() === '') {
      console.log(`Product #${productWithCategory.id} ("${productWithCategory.name}") created without a category. Calling AI category service...`);
      try {
        const aiRequestBody = { item_ids: [productWithCategory.id] };
        console.log('Sending to AI Category API:', aiRequestBody);
        
        const response = await axios.post(this.aiApiUrl, aiRequestBody);
        const resultsArray = response.data;

        if (Array.isArray(resultsArray) && resultsArray.length > 0 && resultsArray[0].category) {
          const aiCategory = resultsArray[0].category;
          console.log(`AI service returned category "${aiCategory}" for product #${productWithCategory.id}`);
          
          productWithCategory = await this.prisma.product.update({
            where: { id: productWithCategory.id },
            data: { category: aiCategory },
          });
        } else {
          console.log('AI service did not return a valid category. Response:', response.data);
        }
      } catch (error) {
        console.error(`AI category assignment failed:`, error.response?.data || error.message);
      }
    }
  try {
    console.log(`Requesting embedding for product #${productWithCategory.id}...`);
    const embeddingResponse = await axios.put(this.embeddingApiUrl, { item_ids: [productWithCategory.id] });

    const resultsArray = embeddingResponse.data;

    if (Array.isArray(resultsArray) && resultsArray.length > 0) {
      const firstResult = resultsArray[0];
     
      const embeddingVector = firstResult?.embedding;

      if (embeddingVector && Array.isArray(embeddingVector)) {
        console.log(` Received embedding. Saving to database...`);
        const vectorString = `[${embeddingVector.join(',')}]`;
        
        await this.prisma.$queryRaw`
          UPDATE "item"
          SET "embedding" = ${vectorString}::vector
          WHERE "id" = ${productWithCategory.id}
        `;
        
        console.log(`Database updated with new embedding for product #${productWithCategory.id}.`);
      } else {
        console.error('Embedding API response object did not contain a valid embedding vector. Result:', firstResult);
      }
    } else {
      console.error('Embedding API did not return a valid array. Response:', resultsArray);
    }
  } catch (error) {
    console.error(` Embedding generation API call failed:`, error.response?.data || error.message);
  }

    try {
      console.log(`translat product #${productWithCategory.id}...`);
      const translateRequestBody = { item_ids: [productWithCategory.id] };
      
      await axios.put(this.translateApiUrl, translateRequestBody);
      
      console.log(` Successfully requested translat for product #${productWithCategory.id}.`);
    } catch (error) {
      console.error(
        ` translat API call failed for product #${productWithCategory.id}:`,
        error.response?.data || error.message,
      );
    }  
    
   
    return productWithCategory;
  }
  
 
  findMany() {
    return this.prisma.product.findMany();
  }

  async update(id: number, dto: CreateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async searchProducts(
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    inStock?: boolean,
  ) {
    return this.prisma.product.findMany({
      where: {
        category: category ?? undefined,
        price: {
          gte: minPrice ?? undefined,
          lte: maxPrice ?? undefined,
        },
        inStock: inStock === undefined ? undefined : inStock,
      },
    });
  }

  async getTotalInventoryValue(): Promise<number> {
    const products = await this.prisma.product.findMany();
    return products.reduce((sum, product) => sum + product.price * product.quantity, 0);
  }

  async getAveragePrice(): Promise<number> {
    const result = await this.prisma.product.aggregate({
      _avg: { price: true },
    });
    return result._avg.price ?? 0;
  }

  async getPriceRange(): Promise<{ min: number; max: number }> {
    const result = await this.prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true },
    });
    return {
      min: result._min.price ?? 0,
      max: result._max.price ?? 0,
    };
  }

  async getProductCountPerCategory(): Promise<{ category: string; count: number }[]> {
    
    const result = await this.prisma.product.groupBy({
      by: ['category'],
      _count: { category: true },
    });
    return result.map(r => ({
      category: r.category,
      count: r._count.category,
    }));
  }

  async getOutOfStockProducts() {
    return await this.prisma.product.findMany({
    where: {
      quantity: 0
    },
    select: {
      id: true,
      name: true,
      category: true,
      price: true
    }
  });
  }

  async getTopExpensiveProducts() {
    return this.prisma.product.findMany({
      orderBy: { price: 'desc' },
      take: 5,
    });
  }

  async getProductsInPriceRange(min: number, max: number) {
    return this.prisma.product.findMany({
      where: {
        price: {
          gte: min,
          lte: max,
        },
      },
    });
  }

  async getRecentProducts(days: number) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.prisma.product.findMany({
      where: {
        createdAt: {
          gt: date,
        },
      },
    });
  }

   async semanticSearch(query: string, top_k: number = 5): Promise<any> {
   
    const searchUrl = `${this.searchApiUrl}/${encodeURIComponent(query)}?top_k=${top_k}`;

    console.log(`Forwarding semantic search to AI service: ${searchUrl}`);

    try {
    
      const response = await axios.get(searchUrl);
      
    
      return response.data;

    } catch (error) {
      console.error(
        `AI semantic search failed for query "${query}":`,
        error.response?.data || error.message,
      );
     
      throw new Error('Failed to perform semantic search via AI service.');
    }
  }
}
