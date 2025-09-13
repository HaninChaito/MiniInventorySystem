import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseBoolPipe, DefaultValuePipe
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { RolesGuard } from '../auth/roles.guard'; 
import { Roles } from '../auth/roles.decorator'; 

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  @UseGuards(RolesGuard) 
  @Roles('Admins') 
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get()
  findMany() {
    return this.productService.findMany();
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('Admins')
  update(@Param('id') id: number, @Body() dto: CreateProductDto) {
    return this.productService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Admins')
  delete(@Param('id') id: number) {
    return this.productService.delete(+id);
  }

 @Get('search')
searchProducts(
  @Query('category') category?: string,
  @Query('minPrice') minPrice?: string,
  @Query('maxPrice') maxPrice?: string,
  @Query('inStock') inStock?: string,
): Promise<any[]> {
  return this.productService.searchProducts(
    category,
    minPrice !== undefined ? Number(minPrice) : undefined,
    maxPrice !== undefined ? Number(maxPrice) : undefined,
    inStock !== undefined ? inStock === 'true' : undefined
  );
}


  

  @Get('stats/total-value')
  getTotalInventoryValue(): Promise<number> {
    return this.productService.getTotalInventoryValue();
  }

  @Get('stats/average-price')
  getAveragePrice(): Promise<number> {
    return this.productService.getAveragePrice();
  }

  @Get('stats/price-range')
  getPriceRange(): Promise<{ min: number; max: number }> {
    return this.productService.getPriceRange();
  }

  @Get('stats/category-count')
  getCountPerCategory(): Promise<{ category: string; count: number }[]> {
    return this.productService.getProductCountPerCategory();
  }

  @Get('stats/out-of-stock')
  getOutOfStock(){
    return this.productService.getOutOfStockProducts();
  }

  @Get('stats/top-expensive')
  getTopExpensive(): Promise<any[]> {
    return this.productService.getTopExpensiveProducts();
  }

  @Get('stats/price-range')
  getProductsInPriceRange(
    @Query('min') min: number,
    @Query('max') max: number,
  ): Promise<any[]> {
    return this.productService.getProductsInPriceRange(Number(min), Number(max));
  }

  @Get('stats/recent')
  getRecentProducts(@Query('days') days: number): Promise<any[]> {
    return this.productService.getRecentProducts(Number(days));
  }

   @Get('search/:query') // Uses a route parameter for the main query
  semanticSearch(
    @Param('query') query: string,
    @Query('top_k') top_k?: number, // Optional query parameter for top_k
  ) {
    return this.productService.semanticSearch(query, top_k);
  }

}
