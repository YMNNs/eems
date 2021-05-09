import Mock from 'mockjs'

Mock.mock(
    '/api/login', // 血的教训：url前面必须要有斜杠
    'post',
    (req) => {
        const {username,password} = JSON.parse(req.body)
        if (username === 'admin' && password === '1'){
            return {
                userId:1,
                role:'admin'
            }
        } else if (username === 'staff' && password === '1'){
            return {
                userId:2,
                role:'staff'
            }
        } else if (username === 'commander' && password === '1'){
            return {
                userId:3,
                role:'commander'
            }
        } else if (username === 'specialist' && password === '1'){
            return {
                userId:4,
                role:'specialist'
            }
        } else {
            return {
                userId: null,
                role: null
            }
        }
    }
)

export default Mock;