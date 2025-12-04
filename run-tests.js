const newman = require('newman');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const runParallel = args.includes('--parallel');
const delayMs = parseInt(args.find(a => a.startsWith('--delay='))?.split('=')[1]) || 500;

// Collection configurations
const collections = [
    {
        name: 'CRUD Regression Tests',
        collection: require('./Books API - CRUD Regression Tests.postman_collection.json'),
        reportFile: 'newman-report-crud.html'
    },
    {
        name: 'Data Driven Tests',
        collection: require('./Books API - Data Driven Tests.postman_collection.json'),
        iterationData: path.join(__dirname, 'books_testdata.csv'),
        folder: '2. Data Driven CRUD',
        reportFile: 'newman-report-datadriven.html'
    }
];

// Promisified newman runner
const runCollection = async (config) => {
    const options = {
        collection: config.collection,
        reporters: ['cli', 'htmlextra'],
        reporter: {
            htmlextra: {
                export: `./reports/${config.reportFile}`,
                title: `Books API - ${config.name}`
            }
        },
        delayRequest: delayMs,
        ...(config.iterationData && { iterationData: config.iterationData }),
        ...(config.folder && { folder: config.folder })
    };

    console.log(`\n🚀 Starting: ${config.name}`);

    return new Promise((resolve, reject) => {
        newman.run(options, (err, summary) => {
            if (err) {
                reject({ name: config.name, error: err });
            } else {
                resolve({ name: config.name, stats: summary.run.stats });
            }
        });
    });
};

// Print summary
const printSummary = (results) => {
    console.log('\n\n========================================');
    console.log('           TEST RUN SUMMARY');
    console.log('========================================\n');

    let totalRequests = 0;
    let failedRequests = 0;
    let totalAssertions = 0;
    let failedAssertions = 0;

    for (const result of results) {
        const { stats } = result;
        totalRequests += stats.requests.total;
        failedRequests += stats.requests.failed;
        totalAssertions += stats.assertions.total;
        failedAssertions += stats.assertions.failed;

        const status = stats.assertions.failed === 0 ? '✅' : '❌';
        console.log(`${status} ${result.name}`);
        console.log(`   Requests: ${stats.requests.total} (${stats.requests.failed} failed)`);
        console.log(`   Assertions: ${stats.assertions.total} (${stats.assertions.failed} failed)\n`);
    }

    console.log('----------------------------------------');
    console.log(`Total requests: ${totalRequests} (${failedRequests} failed)`);
    console.log(`Total assertions: ${totalAssertions} (${failedAssertions} failed)`);
    console.log('----------------------------------------\n');

    return { failedAssertions, failedRequests };
};

// Run collections sequentially
const runSequential = async () => {
    const results = [];
    for (const config of collections) {
        const result = await runCollection(config);
        results.push(result);
    }
    return results;
};

// Run collections in parallel
const runParallelCollections = async () => {
    return Promise.all(collections.map(runCollection));
};

// Main execution
const main = async () => {
    console.log(`\n📋 Running tests ${runParallel ? 'in PARALLEL' : 'SEQUENTIALLY'}`);
    console.log(`⏱️  Request delay: ${delayMs}ms\n`);

    try {
        const results = runParallel
            ? await runParallelCollections()
            : await runSequential();

        const { failedAssertions, failedRequests } = printSummary(results);

        if (failedAssertions > 0 || failedRequests > 0) {
            process.exit(1);
        }
    } catch (error) {
        console.error(`\n❌ Collection "${error.name}" failed:`, error.error);
        process.exit(1);
    }
};

main();
