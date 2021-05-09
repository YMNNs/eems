import {createRouter, createWebHistory} from "vue-router";
// import test from "@/components/test";
import layout from "@/components/layout";
import register from "@/components/register";
// import material_info from "@/components/material_info";
import login from "@/components/login";

/**
 * 未登录的路由表
 * @type {[{path: string, component: {name: string}}]}
 */
export const constantRoutes = [
    {
        path: '/login',
        component: login
    }
]

export const asyncRouterMap = [
    {
        path: '/index',
        component: layout,
        meta: {role: ['admin', 'staff', 'commander', 'specialist']}, //管理员、工作人员、指挥人员、专家
        children:[
            {
                path:'/register',
                component:register,
                meta:{role: ['admin']}
            }
        ]
    }
]

export default createRouter({
    history: createWebHistory(),
    routes: constantRoutes
})

