import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function ProductTable({
  products,
  editProduct,
  deleteProduct,
}) {

  const money = (value) =>
    Number(value).toLocaleString("uz-UZ") + " so'm";

  return (
    <TableContainer component={Paper}>
      <Table>

        <TableHead>

          <TableRow>

            <TableCell><b>#</b></TableCell>

            <TableCell><b>Nomi</b></TableCell>

            <TableCell><b>Model</b></TableCell>

            <TableCell><b>Serial</b></TableCell>

            <TableCell align="center">
              <b>Soni</b>
            </TableCell>

            <TableCell>
              <b>Olish narxi</b>
            </TableCell>

            <TableCell>
              <b>Sotish narxi</b>
            </TableCell>

            <TableCell>
              <b>Foyda</b>
            </TableCell>

            <TableCell align="center">
              <b>Holati</b>
            </TableCell>

            <TableCell align="center">
              <b>Amallar</b>
            </TableCell>

          </TableRow>

        </TableHead>

        <TableBody>

          {products.map((item, index) => (

            <TableRow key={item.id} hover>

              <TableCell>
                {index + 1}
              </TableCell>

              <TableCell>
                {item.name}
              </TableCell>

              <TableCell>
                {item.model}
              </TableCell>

              <TableCell>
                {item.serial_number}
              </TableCell>

              <TableCell align="center">
                {item.quantity}
              </TableCell>

              <TableCell>
                {money(item.purchase_price)}
              </TableCell>

              <TableCell>
                {money(item.sale_price)}
              </TableCell>

              <TableCell>
                {money(
                  item.sale_price -
                  item.purchase_price
                )}
              </TableCell>              <TableCell align="center">
                {Number(item.quantity) <= 5 ? (
                  <Chip
                    label="Kam qoldi"
                    color="error"
                    size="small"
                  />
                ) : (
                  <Chip
                    label="Mavjud"
                    color="success"
                    size="small"
                  />
                )}
              </TableCell>

              <TableCell align="center">

                <IconButton
                  color="primary"
                  onClick={() => editProduct(item)}
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  color="error"
                  onClick={() => deleteProduct(item.id)}
                >
                  <DeleteIcon />
                </IconButton>

              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>
    </TableContainer>
  );
}

export default ProductTable;