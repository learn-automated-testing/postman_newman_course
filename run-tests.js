const newman = require('newman');

newman.run({
    collection: require('./Books API - CRUD Regression Tests.postman_collection.json'),
    reporters: ['cli', 'htmlextra'],
    reporter: {
        htmlextra: {
            export: './reports/newman-report.html',
            title: 'Books API - CRUD Regression Tests'
        }
    }
}, (err, summary) => {
    if (err) {
        console.error('Collection run failed:', err);
        process.exit(1);
    }

    const { stats } = summary.run;
    console.log('\n========== Test Summary ==========');
    console.log(`Total requests: ${stats.requests.total}`);
    console.log(`Failed requests: ${stats.requests.failed}`);
    console.log(`Total assertions: ${stats.assertions.total}`);
    console.log(`Failed assertions: ${stats.assertions.failed}`);

    if (stats.assertions.failed > 0 || stats.requests.failed > 0) {
        process.exit(1);
    }
});
