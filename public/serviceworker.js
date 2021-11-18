// Created this new file for ServiceWorker as part of workshop
//storing files in cache is big benefit of service-worker, so can work offline  without server
//arrays of files to cache offline

const filesToCache = [
    "http://localhost:8888/css/style.css",
    "http://localhost:8888/js/app.js",
    "http://localhost:8888/js/localforage.js",
    "http://localhost:8888/images/icons/favicon.ico",
    "http://localhost:8888/images/icons/icon-144x144.png",
    "http://localhost:8888/manifest.json",
    "http://localhost:8888/", //contains hmtl
    "http://localhost:8888/index.php", //contains same  html as above
    "http://localhost:8888/done"
    "http://localhost:8888/images/blue_cats.jpg",
];
//when u end up with 100s of files, t hen u have multiple caches
//what u get back is html ,browser converts that into dom - sending index.pho returns the html content of the processed php page - both give the same resul but u have to list them  both & cache them   both
//reqeust to index.php actually rreturns index.phtml page
// files are cached based on their url, so  need to specify both so they are both cached

let cacheVersion = 5;
caches.delete('demo-0.0.' + --cacheVersion); //fyi phpstorm complains as we're not doing anything with delete method
const cacheName = 'demo-0.0.' + cacheVersion;

// const cacheName = 'demo' + '-0.0.4'; //could be let, but u cant change consts
// can delete old caches here

//library for IndexDB
importScripts('js/localforage.js');

//self means service-worker & what code to run to dod the install
//code will  cache the files we want - waitUntil  only exists for SWs
//cache.open - once u open a cache u cant change whats in it, this makes caches faster , but if u update ur css u cnat update it on users device 3 wks later - called cache invalidation - so add version numbers to cache name & increments each time u update the cache
//cache api is pomised based

self.addEventListener('install', (event) => {
    event.waitUntil( //waitUntil needs to have a return keyword
        caches.open(cacheName)
            .then((cache) => {
                return cache.addAll(filesToCache); // add all files in array to cache & return it
            })
    )
})

//now when a http request is  made, use the locally stored files, instead of still getting them from teh server
//service-worker have respondWith function
//service-worker is middleman between request and response
// cache is quite smart, knows about urls so  can  match on request obj  nto just url of request
self.addEventListener('fetch', (event) => {
    if (filesToCache.includes(event.request.url)) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        console.log('getting file from cache')
                        return response;
                    } else {
                        console.log('getting file from server')
                        return fetch(event.request);
                    }
                })
        );
    }

    //if request is about getting json data from api
    //service-worker support asyn await syntax so can use that
    if (
        event.request.url === 'http://localhost:8888/api/todo' &&
        event.request.method === 'GET'
    ) {
        event.respondWith(
            async function() {
                // let response = await fetch(event.request);

                //do someting if internet is not available to provide data ie get data from local index db
                let response = await fetch(event.request).catch(async function() {
                    const returnData = {success: true, msg:'', data: []}
                    await localforage.iterate((value, key) => {
                        console.log('key value pairs')
                        returnData.data.push([key, value])
                    })
                    return new Response(JSON.stringify(returnData), {
                        header: {"Content-Type": "application/json"}
                    });
                })

                let data = await response.clone().json(); //clone method is part of Service-worker
                data.data.forEach((todo) => {
                    localforage.setItem(todo[0], todo[1]);
                })
                return response;
            }()
        )
    }
});

//dont need internet if everything required to load page is cached locally
// but for To-Do app, not everything is avail, cant do fetch to load todos
// if u cached the json response from api, u would have To-Do list but it would never get updated - json is cachable file
//if u write todo in php it turns it into blue text
// offline version is  a lttle lame but is still a PWA
