import express  from 'express'

const app = express()

app.get('/', (req, res)=>{
    res.send('server is ready')
})

app.get('/api/jokes', (req, res)=>{
    const jokes = [
        {
            id: 1,
            title: 'first joke',
            content: 'this is the first joke'
        },
        {
            id: 2,
            title: 'second joke',
            content: 'this is the second joke'
        },
        {
            id: 3,
            title: 'third joke',
            content: 'this is the third joke'
        },
        {
            id: 4,
            title: 'fourth joke',
            content: 'this is the fourth joke'
        },
        {
            id: 5,
            title: 'fifth joke',
            content: 'this is the fifth joke'
        },
    ]
    res.send(jokes )
})

const port = process.env.PORT || 3000 ;

app.listen(port, ()=>{
    console.log(`Serve at http://locallhost:${port}`)
})