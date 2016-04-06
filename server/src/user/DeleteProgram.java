package user;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.document.*;
import com.amazonaws.services.dynamodbv2.document.spec.DeleteItemSpec;


public class DeleteProgram {
    public void deleteProgram(String user, String programName)
    {
        String result = "";
        AmazonDynamoDBClient dynamoDBClient = new AmazonDynamoDBClient()
                //.withEndpoint("http://localhost:8000"); //FOR LOCAL
                .withRegion(Regions.US_EAST_1); //FOR LIVE
        DynamoDB dynamoDB = new DynamoDB(dynamoDBClient);

        try
        {
            Table table = dynamoDB.getTable(user);
            DeleteItemSpec deleteItemSpec = new DeleteItemSpec()
                    .withPrimaryKey(new PrimaryKey("programname",programName));
            System.out.println("Attempting a conditional delete...");
            table.deleteItem(deleteItemSpec);
            System.out.println("DeleteItem succeeded");

        }
        catch (Exception e)
        {
            System.err.println("Unable to delete programname: " + programName);
            System.err.println(e.getMessage());
        }
    }
}
