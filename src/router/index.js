import {createRouter, createWebHistory} from "vue-router";
import test from "@/components/test";

export default createRouter({
        history: createWebHistory(),
        routes: [
            {
                path: '/',
                component: test
            }
        ]
    }
)