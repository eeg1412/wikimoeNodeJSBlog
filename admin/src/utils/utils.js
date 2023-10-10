import store from "@/store";
import { ElLoading } from 'element-plus'

let loading = null

let loadingCount = 0;
let loadingTimer = null;

const startLoading = () => {
    store.dispatch("setLoading", true);
    loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(255, 255, 255, 0.7)',
    })
};

const endLoading = () => {
    store.dispatch("setLoading", false);
    if (loading) {
        loading.close()
    }
};

export const showLoading = () => {
    clearTimeout(loadingTimer);
    loadingTimer = setTimeout(() => {
        loadingCount = 1;
        hideLoading();
    }, 30000);
    if (loadingCount === 0) {
        startLoading();
    }
    loadingCount += 1;
};

export const hideLoading = () => {
    if (loadingCount <= 0) {
        return;
    }
    loadingCount -= 1;
    if (loadingCount === 0) {
        clearTimeout(loadingTimer);
        endLoading();
    }
};

export const setSessionParams = (key, data) => {
    sessionStorage.setItem(key, JSON.stringify(data))
}
export const getSessionParams = (key, isSelector) => {
    let data = null
    if (isSelector) {
        return data
    }
    try {
        const strData = sessionStorage.getItem(key)
        if (strData) {
            data = JSON.parse(strData)
        }
    } catch (error) {

    }
    return data
}

export const creatColorByNickName = (NickName) => {
    // nick name to code
    let id = 0;
    for (var i = 0; i < NickName.length; i++) {
        id += NickName.charCodeAt(i);
    }
    id = id % 100;
    const h = id * (360 / 100);
    const s = 80;
    const l = 30;
    return hslToHex(h, s, l);
};
export const hslToHex = (h, s, l) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, "0"); // convert to Hex and prefix "0" if needed
    };
    return `${f(0)}${f(8)}${f(4)}`;
};

export const unique = (arr) => {
    return Array.from(new Set(arr));
}
export const uniqueObjArray = (arr, key) => {
    const map = {
        'string': e => e[key],
        'function': e => key(e),
    }
    const fn = map[typeof key]
    const obj = arr.reduce((o, e) => (o[fn(e)] = e, o), {})
    return Object.values(obj)
}


export const uuid = () => {
    let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
    for (let i = 0, len = chars.length; i < len; i++) {
        switch (chars[i]) {
            case "x":
                chars[i] = Math.floor(Math.random() * 16).toString(16);
                break;
            case "y":
                chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
                break;
        }
    }
    return chars.join("");
}


export const startEndTimeCheck = (rule, value, callback, start, end) => {
    if (start && end) {
        if (new Date(start).getTime() >= new Date(end).getTime()) {
            callback(new Error('开始时间或结束时间的设置有误'))
        } else {
            callback()
        }
    } else {
        callback()
    }

}
