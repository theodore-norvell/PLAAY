package user;


import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.document.*;
import com.amazonaws.services.dynamodbv2.document.spec.ScanSpec;
import com.amazonaws.services.dynamodbv2.document.utils.NameMap;
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap;
import com.amazonaws.services.dynamodbv2.model.*;
import com.amazonaws.services.dynamodbv2.util.Tables;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;

public class SavePrograms {

    public String saveProgram(String usr, String program, String programName)
    {
        AmazonDynamoDBClient dynamoDBClient = new AmazonDynamoDBClient()
                .withEndpoint("http://localhost:8000");

        DynamoDB dynamoDB = new DynamoDB(dynamoDBClient);

        String tableName = usr;
        //Table table = dynamoDB.getTable("PLAAY2");


        try {
            TableDescription table = dynamoDBClient.describeTable(new DescribeTableRequest(tableName))
                    .getTable();
            if (!TableStatus.ACTIVE.toString().equals(table.getTableStatus()))
            {
                //Table does not exist

                System.out.println("Attempting to create table; please wait...");
                Table table2 = dynamoDB.createTable(tableName,
                        Arrays.asList(
                                new KeySchemaElement("programname", KeyType.HASH)),  //Partition key
                        Arrays.asList(
                                new AttributeDefinition("programname", ScalarAttributeType.S)),
                        new ProvisionedThroughput(1L, 1L));
                table2.waitForActive();
                System.out.println("Success.  Table status: " + table2.getDescription().getTableStatus());

                PutItemOutcome outcome = table2.putItem(new Item()
                        .withPrimaryKey("programname", programName)
                        .withString("program", program));
//                ArrayList<AttributeDefinition> attributeDefinitions= new ArrayList<AttributeDefinition>();
//                attributeDefinitions.add(new AttributeDefinition().withAttributeName("programname").withAttributeType("S"));
//
//                ArrayList<KeySchemaElement> keySchema = new ArrayList<KeySchemaElement>();
//                keySchema.add(new KeySchemaElement().withAttributeName("programname").withKeyType(KeyType.HASH));
//
//                CreateTableRequest request = new CreateTableRequest()
//                        .withTableName(tableName)
//                        .withKeySchema(keySchema)
//                        .withAttributeDefinitions(attributeDefinitions)
//                        .withProvisionedThroughput(new ProvisionedThroughput()
//                                .withReadCapacityUnits(1L)
//                                .withWriteCapacityUnits(1L));
//
//                Table newTable = dynamoDB.createTable(request);
//
//                newTable.waitForActive();
            }
            else
            {
                Table table2 = dynamoDB.getTable(usr);

                PutItemOutcome outcome = table2.putItem(new Item()
                        .withPrimaryKey("programname", programName)
                        .withString("program", program));
            }
            return "";
        } catch (ResourceNotFoundException rnfe) {
            // This means the table doesn't exist in the account yet
            return "";
        }
        catch (InterruptedException e)
        {
            return "";
        }

    }

    public String getProgramList(String usr)
    {
        AmazonDynamoDBClient dynamoDBClient = new AmazonDynamoDBClient()
                .withEndpoint("http://localhost:8000");

        DynamoDB dynamoDB = new DynamoDB(dynamoDBClient);

        String tableName = usr;

        try
        {
            TableDescription table = dynamoDBClient.describeTable(new DescribeTableRequest(tableName))
                    .getTable();
            if (!TableStatus.ACTIVE.toString().equals(table.getTableStatus()))
            {
                //Table doesn't exist
                System.out.println("Table does not exist");
                return "";
            }
            else
            {
                Table table1 = dynamoDB.getTable(usr);
                ScanSpec scanSpec = new ScanSpec()
                        .withProjectionExpression("program");
                ItemCollection<ScanOutcome> items = table1.scan(scanSpec);
                String strBuilder = "";

                Iterator<Item> iter = items.iterator();
                while (iter.hasNext()) {
                    Item item = iter.next();
                    strBuilder += item.toString();
                    System.out.println(item.toString());
                }
                return strBuilder;
            }

        } catch (Exception e)
        {
            return "";
        }
    }
}
