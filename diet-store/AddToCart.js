const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-2'});

exports.handler = async (event, context, callback) => {
    
    //1. Extract the query parameters & validate
    console.log("Starting...");
    var body = event.body;
    console.log('Body:', event.body);
    if (event.body !== null && event.body !== undefined) {
        if (!(body.ProductID && body.Quantity)) 
        {
            return {
              statusCode: 409,
              body: JSON.stringify({message: 'Required data was missing', error:null})
            };
        }
        else
        {
            console.log('All required data was supplied');
        }
    }
    
    //check if productID is valid & have sufficient quantity
     const paramsValidation = {
        TableName: 'Product',
        KeyConditionExpression: 'ProductID = :ProductID',
        ExpressionAttributeValues: {
          ':ProductID': body.ProductID
        },
        Limit: 1
      };

  
  try {
      let result = await documentClient.query(paramsValidation).promise();
        console.log("Result..." + result);
        if (result === undefined || result.Count == 0) {
            return  {
                statusCode: 408,
                body: JSON.stringify({ message: 'Invalid product ID' })
              };
        }
     
      
    } catch (e) {
      console.log(e.message);
      
      return {
          statusCode: 408,
          body: JSON.stringify({message: 'There was some type of catastrophic error', error:e})
      };
    }
  

    // Add to shopping cart
    var params = {
        TableName: "ShoppingCart",
        Item: {
            'ShoppingCartID' : body.UserId + "-" +body.ProductID,
            'ProductID': body.ProductID,
            'UserId' : body.UserId,
            'Quantity' : body.Quantity,
            'UpdatedAt': Math.round((new Date()).getTime() / 1000)
        }
    };
    
    var response;
    
    
    try {
        const writeOperation = await documentClient.put(params).promise();
       
      return response = {
        statusCode: 200,
        body: JSON.stringify({ message: 'Item added to shopping cart sucessfully' })
      };
     
      
    } catch (e) {
      console.log(e.message);
      
      return {
          statusCode: 408,
          body: JSON.stringify({message: 'There was some type of catastrophic error', error:e})
      };
    }
};
