// process.on('SIGINT', function () {
//     console.log("Caught interrupt signal");

//     if (i_should_exit)
//         process.exit();
// });

// Handle Ctrl+C exit cleanly 
process.on('SIGINT', () => {
    console.log("Caught interrupt signal");
    process.exit()
});


function mainLoop() {
    console.log("Waiting for interrupt signal");
}

loopTimer = setInterval(mainLoop, 1000);
