import {createRouter, createWebHistory} from "vue-router";
import layout from "@/components/layout";
import register from "@/components/admin/register";
import login from "@/components/login";
import event from "@/components/staff/event";
import material_location from "@/components/staff/material_location";
import material_info from "@/components/staff/material_info";
import err403 from "@/components/err403"
import err404 from "@/components/err404"
import material from "@/components/staff/material";
import process from "@/components/staff/process";
import risk_enterprise from "@/components/staff/risk_enterprise"
import city from "@/components/staff/city"
import case_staff from "@/components/staff/case_staff"
import case_commander from "@/components/commander/case_commander"
import case_specialist from "@/components/specialist/case_specialist"
import emergency from "@/components/commander/emergency"
import dashboard from "@/components/dashboard"
import '@/util/index';

/**
 * 未登录的路由表
 * @type {[{path: string, component: {name: string}}]}
 */
export const constantRoutes = [
    {
        path: '/login',
        component: login,
        name: 'login',
        meta: {title: '登录'},
        hidden: true
    },
    {
        path: '/403',
        component: err403,
        name: 'error403',
        meta: {title: '403错误'},
        hidden: true
    },
    {
        path: '/404',
        component: err404,
        name: 'error404',
        meta: {title: '404错误'},
        hidden: true
    },
    {
        path: '/',
        component: layout,
        name: 'layout',
        redirect: '/dashboard',
        meta: {title: '应急管理系统', role: ['admin', 'staff', 'commander', 'specialist']}, //管理员、工作人员、指挥人员、专家
        children: [
            {
                path: '/dashboard',
                component: dashboard,
                name: 'dashboard',
                meta: {title: '概览', role: ['admin', 'staff', 'commander', 'specialist'], icon: 'icon-dashboard'}
            },
            {
                path: '/register',
                component: register,
                name: 'register',
                meta: {title: '用户管理', role: ['admin'], icon: 'icon-Team'}
            }, {
                path: '/event',
                component: event,
                name: 'event',
                meta: {title: '事件维护', role: ['staff'], icon: "icon-event"}
            }, {
                path: '/material',
                redirect: '/material_info',
                meta: {title: '物资维护', role: ['staff'], icon: "icon-material"},
                component: material,
                name: 'material',
                children: [
                    {
                        path: '/material_info',
                        component: material_info,
                        name: 'material_info',
                        meta: {title: '物资信息维护', role: ['staff']}
                    }, {
                        path: '/material_location',
                        component: material_location,
                        name: 'material_location',
                        meta: {title: '物资位置维护', role: ['staff']}
                    }
                ]
            }, {
                path: '/process',
                meta: {title: '流程维护', role: ['staff'], icon: 'icon-process'},
                component: process,
                name: 'process',
            },
            {
                path: '/risk_enterprise',
                meta: {title: '风险企业维护', role: ['staff'], icon: 'icon-risk'},
                component: risk_enterprise,
                name: 'risk_enterprise',
            },
            {
                path: '/city',
                meta: {title: '城市信息维护', role: ['staff'], icon: 'icon-city'},
                component: city,
                name: 'city',
            },
            {
                path: '/case_staff',
                meta: {title: '接报维护', role: ['staff'], icon: 'icon-report'},
                component: case_staff,
                name: 'case_staff',
            },
            {
                path: '/case_specialist',
                meta: {title: '接报维护', role: ['specialist'], icon: 'icon-report'},
                component: case_specialist,
                name: 'case_specialist',
            }, {
                path: '/case_commander',
                meta: {title: '接报维护', role: ['commander'], icon: 'icon-report'},
                component: case_commander,
                name: 'case_commander',
            }, {
                path: '/emergency',
                meta: {title: '紧急事件处理', role: ['commander'], icon: 'icon-asterisk'},
                component: emergency,
                name: 'emergency',
            },

        ]
    },
    {
        path: '/:catchAll(.*)',
        redirect: '/404',
    },
]


const router = createRouter({
    history: createWebHistory(),
    routes: constantRoutes
})

router.beforeEach(((to, from, next) => {
    if (to.meta.title) {
        // 在router中设置的页面标题
        document.title = to.meta.title
    }
    console.log(to.meta.role)
    let role = localStorage.getItem('role')
    if (to.path === '/login' || to.path === '/403' || to.path === '/404') {
        next()
        return
    }
    if (!role) {
        next('/login')
    } else if (!to.meta.role || to.meta.role.isInArray(role)) {
        next()
    } else {
        next('/403')
    }
}))

export default router

