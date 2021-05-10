import Mock from 'mockjs'

Mock.mock(
    '/api/login', // 血的教训：url前面必须要有斜杠
    'post',
    (req) => {
        const {username, password} = JSON.parse(req.body)
        if (username === 'admin' && password === '1') {
            return {
                userId: 1,
                role: 'admin',
                username: '管理员'
            }
        } else if (username === 'staff' && password === '1') {
            return {
                userId: 2,
                role: 'staff',
                username: '工作人员'
            }
        } else if (username === 'commander' && password === '1') {
            return {
                userId: 3,
                role: 'commander',
                username: '指挥人员'
            }
        } else if (username === 'specialist' && password === '1') {
            return {
                userId: 4,
                role: 'specialist',
                username: '专家'
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