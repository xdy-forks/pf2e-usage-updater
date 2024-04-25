Hooks.once('init', async function() {

});

Hooks.once('ready', async function() {
  Hooks.on("updateWorldTime", async (_total, diff) => {
    //DO stuff to the usage counts on actors
  })
});
