const KEY = "tabs";

export default class Tabs {
    static get count() {
        return Number(localStorage.getItem(KEY) || 0);
    }

    static set count(value: number) {
        localStorage.setItem(KEY, value.toString());
    }

    static increment() {
        Tabs.count = Tabs.count + 1;
    }

    static decrement() {
        Tabs.count = Tabs.count - 1;
    }
}