import instance from "@/api/request";

export const Login = (res) => {
    return instance({
        url: 'login',
        method: 'post',
        data: res
    })
}
