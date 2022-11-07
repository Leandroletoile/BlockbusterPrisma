describe('Peticion GET /tasks', () => {
    test('should respond with a 200 status', async () => { 
      const response = await request(server).get('/tasks').send()
      expect(response.status).toBe(200)
    })  
  
    test("should respond with an array", async () => {
      const response = await request(server).get('/tasks').send()
      expect(response.body).toBeInstanceOf(Array)
    })
  })
  
  describe("Peticion POST /tasks", () => {
      describe("Given a title and a description", () => {
          test("should respond with a 200 status code", async () => {
              const response = await request(server).post("/tasks").send(newTask)
              expect(response.status).toBe(200)
          })
          
          test("should respond with a content-type of application/json", async () => {
              const response = await request(server).post("/tasks").send(newTask)
              expect(response.type).toBe("application/json")
              expect (response.headers["content-type"]).toEqual(expect.stringContaining("json"))
          })
      
           test("should respond with a json object with the task created", async () => {
              const response = await request(server).post("/tasks").send(newTask)
              expect(response.body).toBeInstanceOf(Object)    
              expect(response.body.id).toBeDefined()
          })
      })
  
      describe("When title and description are missing", () => {
          const fields = [
              {},
              {title: "Tarea 1"},
              {description: "Descripcion de la tarea 1"}
          ]
  
          for(const field of fields) {
              test("should respond with a 400 status code", async () => {
                  const response = await request(server).post("/tasks").send(field)
                  expect(response.status).toBe(400)
              })
          }
  
  
  
          test("should respond with a 400 status code", async () => {
              const response = await request(server).post("/tasks").send({})
              expect(response.status).toBe(400)
          })
      })
  })