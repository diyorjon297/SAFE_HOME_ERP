import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  Chip,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhoneIcon from "@mui/icons-material/Phone";
import PaymentsIcon from "@mui/icons-material/Payments";
import CameraOutdoorIcon from "@mui/icons-material/CameraOutdoor";
import BuildIcon from "@mui/icons-material/Build";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";


export default function CustomerDetail(){

const {id}=useParams();
const navigate=useNavigate();

const [customer,setCustomer]=useState(null);
const [loading,setLoading]=useState(true);



useEffect(()=>{

const load=async()=>{

try{

const res=await API.get(`/customers/${id}`);

setCustomer(res.data);

}catch(err){

console.log(err);

}
finally{

setLoading(false);

}

};

load();

},[id]);




if(loading){

return(

<Box
display="flex"
justifyContent="center"
mt={10}
>

<CircularProgress/>

</Box>

);

}



if(!customer){

return(

<Container>

<Typography variant="h5">
Mijoz topilmadi
</Typography>

</Container>

);

}



return(

<Container maxWidth="lg">


<Button

startIcon={<ArrowBackIcon/>}

sx={{mb:3}}

onClick={()=>navigate("/customers")}

>

Orqaga

</Button>




<Card elevation={5} sx={{mb:3}}>

<CardContent>


<Typography
variant="h4"
fontWeight="bold"
>

👤 {customer.name}

</Typography>


<Typography
color="text.secondary"
mt={1}
>

Mijoz ID: #{customer.id}

</Typography>



<Box mt={2}>


<Chip

icon={<PhoneIcon/>}

label={customer.phone}

sx={{mr:1}}

onClick={()=>
window.location.href=`tel:${customer.phone}`
}

/>


<Chip

label={
customer.object || "Obyekt yo'q"
}

/>



</Box>


</CardContent>

</Card>





<Grid container spacing={3}>


<Grid item xs={12} md={3}>

<Card elevation={4}>

<CardContent>


<Typography
color="text.secondary"
>

💰 Qarz

</Typography>


<Typography
variant="h5"
fontWeight="bold"
color={
customer.debt>0
?"error"
:"success"
}
>

{customer.debt || 0} so'm

</Typography>


</CardContent>

</Card>

</Grid>





<Grid item xs={12} md={3}>

<Card elevation={4}>

<CardContent>


<Typography
color="text.secondary"
>

🛒 Sotuvlar

</Typography>


<Typography variant="h5">

0

</Typography>


</CardContent>

</Card>

</Grid>





<Grid item xs={12} md={3}>

<Card elevation={4}>

<CardContent>


<Typography
color="text.secondary"
>

📷 Kameralar

</Typography>


<Typography variant="h5">

0

</Typography>


</CardContent>

</Card>

</Grid>





<Grid item xs={12} md={3}>

<Card elevation={4}>

<CardContent>


<Typography
color="text.secondary"
>

🔧 Servis

</Typography>


<Typography variant="h5">

0

</Typography>


</CardContent>

</Card>

</Grid>






<Grid item xs={12} md={6}>


<Card elevation={4}>

<CardContent>


<Typography
variant="h6"
fontWeight="bold"
>

Mijoz ma'lumotlari

</Typography>


<Divider sx={{my:2}}/>


<List>


<ListItem>

<ListItemText

primary="Telefon"

secondary={customer.phone}

/>

</ListItem>



<ListItem>

<ListItemText

primary="Manzil"

secondary={
customer.address || "Kiritilmagan"
}

/>

</ListItem>


<ListItem>

<ListItemText

primary="Obyekt"

secondary={
customer.object || "Kiritilmagan"
}

/>

</ListItem>


</List>



<Button

variant="contained"

startIcon={<PhoneIcon/>}

href={`tel:${customer.phone}`}

>

Qo'ng'iroq

</Button>



</CardContent>

</Card>


</Grid>







<Grid item xs={12} md={6}>


<Card elevation={4}>

<CardContent>


<Typography
variant="h6"
fontWeight="bold"
>

Amallar

</Typography>


<Divider sx={{my:2}}/>



<Button

fullWidth

variant="contained"

startIcon={<AddShoppingCartIcon/>}

sx={{mb:2}}

>

Yangi sotuv qo'shish

</Button>



<Button

fullWidth

variant="outlined"

startIcon={<PaymentsIcon/>}

>

Qarz to'lash

</Button>



</CardContent>

</Card>


</Grid>








<Grid item xs={12}>


<Paper elevation={4} sx={{p:3}}>


<Typography
variant="h6"
fontWeight="bold"
>

📋 Tarix

</Typography>


<Divider sx={{my:2}}/>


<Typography color="text.secondary">

Hozircha tarix mavjud emas

</Typography>


</Paper>


</Grid>





</Grid>


</Container>

);

}