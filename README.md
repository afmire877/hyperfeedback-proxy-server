# hyperfeedback-proxy-server

Proxy server for Hyperfeedback

To send information to proxied site

On the Hyperfeedback App:

```js
const frame = document.getElementById('your-frame-id');
frame.contentWindow.postMessage(/*any variable or object here*/, 'http://your-second-site.com');

```

In the proxied site, we inject this in.

```js
window.addEventListener('message', (event) => {
  // IMPORTANT: check the origin of the data!
  if (event.origin.startsWith('http://your-first-site.com')) {
    // The data was sent from your site.
    // Data sent with postMessage is stored in event.data:
    console.log(event.data);
  } else {
    // The data was NOT sent from your site!
    // Be careful! Do not use it. This else branch is
    // here just for clarity, you usually shouldn't need it.
    return;
  }
});
```
