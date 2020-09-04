const express = require('express');
const _ = require('underscore');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/authentication');

let app = express();

let Categoria = require('../models/categoria');

// ------------------------------------------
//  Mostrar todas las categorías
// ------------------------------------------
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.count((err, conteo) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    categorias,
                    conteo
                });

            })
        });

});

// ------------------------------------------
//  Mostrar categoría por ID
// ------------------------------------------

app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })

    });

});

app.post('/categoria', [verificaToken, verificaAdmin_Role], (req, res) => {

    //Almaceno en la variable body los datos enviados desde el formulario
    let body = req.body;

    // Asigno el valor obtenido del body en la variable categoria del Schema Categoria
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    // Guardo los los datos
    categoria.save((err, categoriaDB) => {
        // Si existe un error retorno error 500 y muestro el error, al retornar se detiene la función
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        // Si todo sale bien, ok será true y muetro la categoria que se agregó
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

app.put('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    // Almaceno en la variable id el dato obtenido de la ruta 'id'
    let id = req.params.id;
    // Almaceno en la variable body los datos enviados del formulario
    let body = _.pick(req.body, ['descripcion']);

    // Ejecuto la función 'findByIdAndUpdate' pasando los parametros necesarios 'id de la categoria a eliminar' y 'body los nuevos datos'
    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {
        // Si existe un error retorno error 500 y muestro el error, al retornar se detiene la función
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe categoría'
                }
            });
        }
        // Si todo sale bien, ok será true y muetro la categoria que se actualizó
        res.json({
            ok: true,
            descripcion: categoriaDB
        });
    });
});

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;

    Categoria.findByIdAndDelete(id, (err, categoriaBorrada) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe categoría'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrada,
            message: 'Categoria borrada'
        })

    })
});



module.exports = app;