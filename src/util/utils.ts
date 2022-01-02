export function toPromise<T extends Array<any>>(generator: (promiseCallbackFn: (any) => void) => any): Promise<T> {

    const promise = new Promise<T>((resolve, reject) => {
        generator(function() {
            resolve(Array.from(arguments) as T);
        })
    })
    return promise;
}