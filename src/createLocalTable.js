import { DynamoDB } from "aws-sdk"

export default (err, req, res, next) => {
    const dynamoDb = new DynamoDB({ region: 'us-east-1', endpoint: 'http://localhost:4569' })

    dynamoDb.createTable({
        TableName: 'LeagueResults',
        KeySchema: [{ AttributeName: "seasonYear", AttributeType: "RANGE" }],
        AttributeDefinitions: [{ AttributeName: "seasonYear", AttributeType: "N" }]
    }, console.log)
}