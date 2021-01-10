const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-2'});


exports.handler = async (event, context, callback) => {
    
    const params = {
      TableName: 'Product'
    }
 
    var formattedParams = {
        TableName: 'Product',
        ProjectionExpression: "ProductID, ProductName, Quantity, UpdatedAt"
    };
    
    let scanResults = [];
    let items;
    do{
        items =  await documentClient.scan(formattedParams).promise();
        items.Items.forEach((item) => scanResults.push(item));
        formattedParams.ExclusiveStartKey  = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey != "undefined");
    
    const response = {
        statusCode: 200,
        body: JSON.stringify(scanResults),
    };

    return response;
};
