import express from 'express';
const { Router } = express;
import { users } from '../models/user.js';
//Instanciando de la clase Router
const routerLogin = new Router();

routerLogin.get('/:invalido?', (req, res)=>{
    const credencialInvalida = req.params.invalido;
    res.render('login', {credencialInvalida});
})

routerLogin.post('/', async (req, res)=>{
    const {email, password} = req.body; //lo que viene del formulario login
    const user = await buscarUsuario(email, password);
    if(user){
        res.redirect('formulario-productos');
    }else{
        res.redirect('login/'+true);
    }
})

async function buscarUsuario(email, password){
    const user = await users.findOne({email, password});
    return user;
}

export default routerLogin; 