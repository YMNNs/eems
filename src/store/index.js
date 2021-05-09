import {createStore} from'vuex'
import {Login} from '@/api/user'

export default createStore({
    state:{
        role:''
    },
    mutations:{
        SET_ROLE:(state,role) =>{
            state.role = role
        }
    },
    actions:{
        LoginResult({commit},userInfo){
            return new Promise(((resolve, reject) => {
                Login(userInfo).then(response => {
                    const {userId,role} = response.data
                    localStorage.setItem('user', null)
                    localStorage.setItem('role', null)
                    if (userId>0){
                        localStorage.setItem('user', userId)
                        localStorage.setItem('role', role)
                        commit('SET_ROLE',role)
                    }
                    resolve(response.data)
                }).catch(error =>{
                    console.log('login error')
                    reject(error)
                })
            }))
        }
    },
    getters:{

    }
})