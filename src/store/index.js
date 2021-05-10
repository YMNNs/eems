import {createStore} from 'vuex'
import {Login} from '@/api/user'
import router from '@/router'

export default createStore({
    state: {
        role: ''
    },
    mutations: {
        SET_ROLE: (state, role) => {
            state.role = role
        }
    },
    actions: {
        LoginResult({commit}, userInfo) {
            return new Promise(((resolve, reject) => {
                Login(userInfo).then(response => {
                    const {userId, role, username} = response.data
                    localStorage.removeItem('user')
                    localStorage.removeItem('role')
                    localStorage.removeItem('username')
                    if (userId > 0) {
                        localStorage.setItem('user', userId)
                        localStorage.setItem('role', role)
                        localStorage.setItem('username', username)
                        commit('SET_ROLE', role)
                        router.push('/')
                    }
                    resolve(response.data)
                }).catch(error => {
                    console.log('login error')
                    reject(error)
                })
            }))
        }
    },
    getters: {}
})