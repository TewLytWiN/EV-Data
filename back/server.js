const express = require('express')
const app = express()
const cors = require('cors')
const port = 3000

app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello ITD Dev')
})

app.listen(port, () => {
    console.log(`App is running on http://localhost:${port}`)
})

const {MongoClient, ObjectId} = require('mongodb');
const uri = 'mongodb://localhost:27017/';

app.get('/evlist', async(req, res) => {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const objects = await client.db('KEEN').collection('EV')
            .find({})
            .sort({ updatedAt: -1 })  // เรียงลำดับตาม updatedAt ล่าสุดก่อน
            .toArray();
        res.status(200).json(objects);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data from database.");
    } finally {
        await client.close();
    }
});

app.post('/evlist/create', async(req, res) => {
    const object = req.body;
    const client = new MongoClient(uri);
    await client.connect();
    const now = new Date();
    const result = await client.db('KEEN').collection('EV').insertOne({
        ...object,
        createdAt: now,
        updatedAt: now
    });

    await client.close();
    res.status(200).send({
        "status": "ok",
        "message": "Object is created",
        "object": object['Region'],
        "newObject": {
            _id: result.insertedId,
            ...object,
            createdAt: now,
            updatedAt: now
        }
    });
});

app.put('/evlist/update', async(req, res) => {
    const object = req.body;
    const id = object._id;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const now = new Date();
        const result = await client.db('KEEN').collection('EV').updateOne(
            {'_id': new ObjectId(id)},
            {
                "$set": {
                    region: object.region,
                    category: object.category,
                    parameter: object.parameter,
                    mode: object.mode,
                    powertrain: object.powertrain,
                    year: object.year,
                    unit: object.unit,
                    value: object.value,
                    updatedAt: now
                }
            }
        );
        
        if (result.matchedCount === 0) {
            res.status(404).send({
                'status': "error",
                'message': "Object with ID " + id + " not found."
            });
        } else {
            res.status(200).send({
                'status': "ok",
                'message': "Object with ID " + id + " is updated.",
                'object': {...object, updatedAt: now}
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({
            'status': "error",
            'message': "An error occurred while updating the object."
        });
    } finally {
        await client.close();
    }
});


app.delete('/evlist/delete', async(req, res) => {
    const id = req.body._id;
    const client = new MongoClient(uri);
    await client.connect();
    await client.db('KEEN').collection('EV').deleteOne({"_id": ObjectId(id)});
    await client.close();
    res.status(200).send({
        "status": "ok",
        "message": "Object with ID "+ id + " is deleted."
    });
});

app.post('/evlist/search', async(req, res) => {
    const searchTerms = req.body.searchTerms || [];
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const queries = searchTerms.map(term => {
            const trimmedTerm = term.trim();
            const numericTerm = parseFloat(trimmedTerm);
            const regexTerm = new RegExp(trimmedTerm, 'i');
            
            return {
                $or: [
                    { region: regexTerm },
                    { category: regexTerm },
                    { parameter: regexTerm },
                    { mode: regexTerm },
                    { powertrain: regexTerm },
                    { year: regexTerm },
                    { unit: regexTerm },
                    { value: regexTerm },
                    ...(
                        !isNaN(numericTerm) 
                        ? [
                            { year: numericTerm },
                            { value: numericTerm }
                          ] 
                        : []
                    )
                ]
            };
        });

        const query = queries.length > 1 ? { $and: queries } : queries[0];

        const objects = await client.db('KEEN').collection('EV').find(query).toArray();
        res.status(200).json({ EVData: objects });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data from database.");
    } finally {
        await client.close();
    }
});

app.get('/evlist/:id', async(req, res) => {
    const id = req.params.id;
    const client = new MongoClient(uri);
    await client.connect();
    const object = await client.db('KEEN').collection('EV').findOne({ "_id": ObjectId(id) });
    await client.close();
    res.status(200).send({
        "status": "ok",
        "ID": id,
        "EVData": object
    });
});