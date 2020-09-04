const express = require('express');
const _ = require('underscore');

let { verificaToken } = require('../middlewares/authentication');

let app = express();
let Producto = require('../models/producto');
const { populate } = require('../models/producto');


// ===============================
// Obtener todos los productos - completado
// ===============================
app.get('/productos', verificaToken, (req, res) => {
    // trae todos los productos
    // populate: usuario categoria
    // paginado
    let desde = req.query.desde || 0;
    desde = Number(desde);

    // let limite = req.query.limite || 5;
    // limite = Number(limite);

    Producto.find({ status: true })
        .skip(desde)
        .limit(5)
        .sort('nombre')
        .populate('usuario', 'email nombre')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.count((err, conteo) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    productos,
                    conteo
                });

            })

        });





});

// ===============================
// Obtener un producto por ID - completado
// ===============================
app.get('/productos/:id', verificaToken, (req, res) => {
    // populate: usuario categoria

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'email nombre')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }
            res.json({
                ok: true,
                producto: productoDB
            })
        });

    // Solución Alonso
    // Producto.findById(id, (err, productoDB) => {

    //         if (err) {
    //             return res.status(500).json({
    //                 ok: false,
    //                 err
    //             });
    //         }

    //         res.json({
    //             ok: true,
    //             producto: productoDB
    //         })

    //     })
    //     .populate('usuario', 'email nombre')
    //     .populate('categoria', 'descripcion');


});

// ===============================
// Buscar producto
// ===============================

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i')

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            })
        });


});


// ===============================
// Crear un nuevo producto
// ===============================
app.post('/productos', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado de categoria

    //Almaceno en la variable body los datos enviados desde el formulario
    let body = req.body;

    // Asigno el valor obtenido del body en la variable producto del Schema Producto

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    // Guardo los los datos
    producto.save((err, productoDB) => {
        // Si existe un error retorno error 500 y muestro el error, al retornar se detiene la función
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        // Si todo sale bien, ok será true y muetro la categoria que se agregó
        res.json({
            ok: true,
            usuario: productoDB
        });
    })

});

// ===============================
// Actualizar un producto - completado
// ===============================
app.put('/productos/:id', (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado de categoria

    // Almaceno en la variable id el dato obtenido de la ruta 'id'
    let id = req.params.id;

    // Almaceno en la variable body los datos enviados del formulario
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'categoria']);

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe producto'
                }
            });
        }
        // Si todo sale bien, ok será true y muetro la categoria que se actualizó
        res.json({
            ok: true,
            descripcion: productoDB
        });

    })

});

// ===============================
// Borrar un producto - completado
// ===============================
app.delete('/productos/:id', (req, res) => {
    // cambiar el campo status a falso

    let id = req.params.id;
    let cambiarEstado = {
        status: false
    };

    Producto.findByIdAndUpdate(id, cambiarEstado, { new: true, runValidators: true, context: 'query' }, (err, productoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (productoBorrado.estado === false) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: productoBorrado
        })


    });



});


module.exports = app;