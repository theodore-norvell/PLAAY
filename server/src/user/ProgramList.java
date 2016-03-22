package user;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.document.*;
import com.amazonaws.services.dynamodbv2.document.spec.ScanSpec;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Created by dillonbutt on 2016-03-20.
 */
public class ProgramList
{
    public List<String> getProgramList(String usr)
    {
        List<String> result = new ArrayList<String>();
        AmazonDynamoDBClient dynamoDBClient = new AmazonDynamoDBClient()
                .withEndpoint("http://localhost:8000"); //FOR LOCAL
        //.withRegion(Regions.US_EAST_1); //FOR LIVE
        DynamoDB dynamoDB = new DynamoDB(dynamoDBClient);

        try
        {
            Table table = dynamoDB.getTable(usr);
            ScanSpec scanSpec = new ScanSpec()
                    .withProjectionExpression("programname");

            ItemCollection<ScanOutcome> items = table.scan(scanSpec);

            Iterator<Item> iter = items.iterator();
            while (iter.hasNext()) {
                Item item = iter.next();
                result.add(item.asMap().values().toArray()[0].toString());
                System.out.println(item.toString());
            }
            return result;
        }
        catch (Exception e)
        {
            return null;
        }
    }
}
