process.env.NODE_ENV = 'test'

import { UsuariosModel } from '../models/Model.js'

import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../index.js'
const should = chai.should()

chai.use(chaiHttp)

describe('Users', () => {
    beforeEach((done) => {
        UsuariosModel.deleteMany({}, (err) => { 
           done()
        })
    })

    describe('Peticion GET', () => {
        it('it should GET all the users', (done) => {
          chai.request(server)
              .get('/api/v1/users')
              .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('data')
                    res.body.data.should.be.a('array')
                    res.body.data.length.should.be.eql(0)
                done();
              });
        });
    });

    describe('Peticion POST', () => {
        it('Deberia publicar un usuario', (done) => {
            let user = {
                name:"Carla Matuta",
                age: 48,
                band: "Los Nocheros"
            }
          chai.request(server)
              .post("/api/v1/users")
              .send(user)
              .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.a('object')
                    res.body.should.have.property('msg').eql('Usuario creado correctamente!!')
                    res.body.should.have.property('data')
                    res.body.data.should.have.property('name')
                    res.body.data.should.have.property('age')
                    res.body.data.should.have.property('band')
                done();
              });
        });
    });
});
