const ENTITIES_MAP = {
    "&nbsp;": " ",
};

const ENTITIES_ARR = Object.keys(ENTITIES_MAP).map(find => {
    return {
        find: new RegExp(`${find}`, "g"),
        replace: ENTITIES_MAP[find],
    };
});
export default function sanitize(source: string) {
    for(let entity of ENTITIES_ARR) {
        source = source.replace(entity.find, entity.replace);
    }

    return source;
}