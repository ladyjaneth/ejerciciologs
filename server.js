import {faker} from '@faker-js/faker';
import express from 'express';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import CRUD from './db/conf.js';
import { authors } from './models/author.js';
import { mensajes } from './models/mensaje.js';
import session from 'express-session';
import { users } from './models/user.js';
import passport from 'passport';

//Rutas
import routerProductos from './rutas/Productos.js'; //importar la ruta del archivo Productos
import routerLogin from './rutas/Auth.js'; //importat la ruta del archivo CarritoCompra


faker.locale = 'es';

//const { Socket } = require('dgram');



const app=express();
const httpServer= HttpServer(app);
const io= new Server(httpServer);

app.use(session({
    secret: 'esteesmisecret',
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge: 60000
    }
}));

app.use(express.json());

app.use((req, res, next)=>{
    req.isAuthenticated = ()=>{
        if(req.session.nombre){
            return true
        }
        return false
    }
    req.logout = done =>{
        req.session.destroy(done)
    }
    next()
})



//para poder utilizar los archivos de html en la carpeta public
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true})); //PERMITE PASAR DATOS PORLA URL, BODY

app.set('views', './views');
app.set('view engine', 'pug');

const PORT = 8080;
httpServer.listen(PORT, ()=>{
    console.log(`servidor escuchando en el puerto ${PORT}`);
});

//se usan las dos rutas
app.use('/login', routerLogin);
app.use('/productos', routerProductos);

//generar laconexión por websocket -- servidor de websocketque tenemos en la variable io
 io.on('connection',async socket=>{
    console.log('conexión al socket');
    try{
        await CRUD();
        let mensajesDB = await mensajes.find();
        console.log('Un cliente se ha conectado'); 
        //cuando ya se ha conectado emitir los mensajes que hayan habido 
        socket.emit('messages',mensajesDB);//backend al fronend
        socket.on('new-message', async data=>{ //recibiendo el mensaje que le envian del fronend
            try{
                await CRUD();
                await mensajes.create(data);//guardando el mensaje
                mensajesDB = await mensajes.find();
                io.sockets.emit('messages', mensajesDB)
            }catch(exception){
                console.log(exception);
            }
        })
    }catch(exception){
        console.log(exception);
    }
})


function requireAuthentication(req, res, next){
    if(req.isAuthenticated()){
        next()
    }else{
        res.redirect('/login')
    }
}






app.get('/', async(req, res)=>{
    if(req.isAuthenticated()){
        res.redirect('formulario-productos');
    }else{
        res.redirect('login');
    }
});

app.get('/formulario-productos', async(req, res)=>{
    const productos = await contenedor.getAll(); //trae todos los productos
    res.render('formulario', { productos }); //le paso la vista que quiero que muestre 
});



app.get('/api/productos-test', (req, res)=>{
    const productos = [];
    for(let i = 0; i < 5; i++){
        productos.push({
            nombre: faker.commerce.product(),
            precio: faker.commerce.price(),
            foto: faker.image.imageUrl(64, 64, 'products')
        });
    }
    res.render('productos-test', { productos });
})




app.get('/registro', (req, res)=>{
    const usuarioExistente = req.query.usuarioexistente ? true : false;
    console.log('usuarioExistente', req.query);
    res.render('registro', {usuarioExistente});
})

app.post('/registro', async(req, res)=>{
    const user = req.body;
    const usuarioExistente = await buscarUsuario(user.email, user.password);
    if(!usuarioExistente){
        await users.create(user);        
        res.redirect('login');
    }else{
        res.redirect('registro?usuarioexistente=1');
    }
    console.log(req.body);
})

