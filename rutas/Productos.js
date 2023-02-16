import express from 'express';
const { Router } = express;
//Instanciando de la clase Router
const routerProductos = new Router();

import Contenedor from '../manejadorarchivos.js';
const contenedor = new Contenedor();

//pinta los productos 
routerProductos.get('/',async (req, res)=>{
    const productos = await contenedor.getAll();
    res.render('productos', { productos });
});

routerProductos.get('/:id',async(req, res)=>{
    const productoId = Number(req.params.id);
    const producto  = await contenedor.getById(productoId);
    res.json({producto});
})

//GUARDAR PRODUCTOS
routerProductos.post('/',async (req, res)=>{
    const producto = await req.body; //recibo el producto
    console.log(producto);
    //contenedor.save(producto); 
    res.redirect('/');  //redireccionar a la ruta principal
});

routerProductos.put('/:id', async(req, res)=>{
    const productoID = Number(req.params.id);
    const producto = req.body;
    producto.id = productoID;
    console.log(req.body);
    contenedor.update(producto);
    res.json({});
})

//EXPORTAMOS EL ROUTER CARRITO COMPRA para donde lo vayamos a utlizar
export default routerProductos; 