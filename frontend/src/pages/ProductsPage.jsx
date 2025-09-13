import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './ProductsPage.css';
// --- INTEGRATE: Import Redux thunks ---
import { fetchProducts, deleteProduct,searchByMeaning } from '../features/products/productsSlice';

// --- MATERIAL-UI Imports ---
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { visuallyHidden } from '@mui/utils';


const headCells = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Product Name' },
  { id: 'category', numeric: false, disablePadding: false, label: 'Category' },
  { id: 'price', numeric: true, disablePadding: false, label: 'Price ($)' },
  { id: 'quantity', numeric: true, disablePadding: false, label: 'Quantity' },
  { id: 'inStock', numeric: false, disablePadding: false, label: 'In Stock' },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all products' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// --- Enhanced Table Toolbar (adapted to include filters and delete action) ---
function EnhancedTableToolbar(props) {
  const { numSelected, selectedProductIds, handleDeleteSelected, filterProps } = props;
  const { search, setSearch, category, setCategory, allCategories } = filterProps;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) => alpha(theme.palette.secondary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
          Products
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton onClick={() => handleDeleteSelected(selectedProductIds)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
                {allCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                ))}
            </select>
        </Box>
      )}
    </Toolbar>
  );
}

export default function ProductsPage() {
  const dispatch = useDispatch();
  
 // const { items: allProducts, status, error } = useSelector((state) => state.products || {});
  const allProducts = useSelector((state) => state.products?.items ?? []);
  const status = useSelector((state) => state.products?.status ?? 'idle');
  const error = useSelector((state) => state.products?.error ?? null);


  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
   const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [semanticQuery, setSemanticQuery] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

 
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      if (search && !product.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== 'All' && product.category !== category) return false;
      if (minPrice && product.price < parseFloat(minPrice)) return false;
      if (maxPrice && product.price > parseFloat(maxPrice)) return false;
      if (inStockOnly && !product.inStock) return false;
      return true;
    });
  }, [allProducts, search, category, minPrice, maxPrice, inStockOnly]);


  const allCategories = useMemo(() => {
    return ['All', ...new Set(allProducts.map(p => p.category))];
  }, [allProducts]);

  
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredProducts.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };
  

  const handleDeleteSelected = (selectedIds) => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} product(s)?`)) {
    
      selectedIds.forEach(id => dispatch(deleteProduct(id)));
      setSelected([]);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredProducts.length) : 0;



  const handleSemanticSearch = (e) => {
    e.preventDefault();
    if (!semanticQuery.trim()) {
      dispatch(fetchProducts());
    } else {
      // Dispatch the new action with the query object
      dispatch(searchByMeaning({ query: semanticQuery, top_k: 5 }));
    }
  };
  
  
  const visibleRows = useMemo(
    () =>
      filteredProducts
        
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [ page, rowsPerPage, filteredProducts],
  );

 
  if (status === 'loading') return <p>Loading Products...</p>;
  if (status === 'failed') return <p>Error: {error}</p>;

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
         <Typography variant="h4" component="h1" gutterBottom>
     Products
      </Typography>
{/* --- ADD THE NEW SEMANTIC SEARCH BAR --- */}
        <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleSemanticSearch} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Search by meaning..."
            value={semanticQuery}
            onChange={(e) => setSemanticQuery(e.target.value)}
            className="search-input"
            style={{ flexGrow: 1 }}
          />
          <button type="submit">Semantic Search</button>
        </form>
      </Paper>
      {/* --- RESTORED: The original filter UI --- */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <div className="filters">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            {allCategories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="search-input"
          />
          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="search-input"
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={() => setInStockOnly(!inStockOnly)}
            />
            In Stock Only
          </label>
        </div>
      </Paper>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar 
            numSelected={selected.length} 
            selectedProductIds={selected}
            handleDeleteSelected={handleDeleteSelected}
            filterProps={{ search, setSearch, category, setCategory, allCategories }}
        />
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={filteredProducts.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected.indexOf(row.id) !== -1;
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" checked={isItemSelected} inputProps={{ 'aria-labelledby': labelId }}/>
                    </TableCell>
                    {/* ADAPT: Render Product data instead of nutrition data */}
                    <TableCell component="th" id={labelId} scope="row" padding="none">{row.name}</TableCell>
                    <TableCell align="left">{row.category}</TableCell>
                    <TableCell align="right">${row.price.toFixed(2)}</TableCell>
                    <TableCell align="right">{row.quantity}</TableCell>
                    <TableCell align="left">{row.inStock ? '✅ In Stock' : '❌ Out of Stock'}</TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}