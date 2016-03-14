package user;

import java.io.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.model.AttributeDefinition;
import com.amazonaws.services.dynamodbv2.model.KeySchemaElement;
import com.amazonaws.services.dynamodbv2.model.KeyType;
import com.amazonaws.services.dynamodbv2.model.ProvisionedThroughput;
import com.amazonaws.services.dynamodbv2.model.ScalarAttributeType;

public class LoginRequest extends HttpServlet
{
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException
    {
        HttpSession session = request.getSession();

        String username = request.getParameter("username");
        String pword = request.getParameter("password");

        String loginRequest = new LoginUser().login(username,pword);
        String result = "";
        if (loginRequest.equals("True"))
        {
            result = "{\"username\": \""+username+"\",\n" +
                    "\"result\": \"SUCCESS\"}";
        }
        else if (loginRequest.equals("Error"))
        {
            result = "{\"username\": \"null\",\n" +
                    "\"result\": \"ERROR\"}";
        }
        else if (loginRequest.equals("Incorrect"))
        {
            result = "{\"username\": \"null\",\n" +
                    "\"result\": \"WRONGCREDENTIALS\"}";
        }

        session.setAttribute("loggedInUserId",username);

        PrintWriter out = response.getWriter();
        //out.println(username);
        //out.println(pword);
        out.println(result);
    }

    private void login(String uname, String pword)
    {
        AmazonDynamoDBClient client = new AmazonDynamoDBClient()
                .withEndpoint("http://localhost:8000");

        DynamoDB dynamoDB = new DynamoDB(client);

        String tableName = "Movies";

        try {
            System.out.println("Attempting to create table; please wait...");
            Table table = dynamoDB.createTable(tableName,
                    Arrays.asList(
                            new KeySchemaElement("year", KeyType.HASH),  //Partition key
                            new KeySchemaElement("title", KeyType.RANGE)), //Sort key
                    Arrays.asList(
                            new AttributeDefinition("year", ScalarAttributeType.N),
                            new AttributeDefinition("title", ScalarAttributeType.S)),
                    new ProvisionedThroughput(10L, 10L));
            table.waitForActive();
            System.out.println("Success.  Table status: " + table.getDescription().getTableStatus());

        } catch (Exception e) {
            System.err.println("Unable to create table: ");
            System.err.println(e.getMessage());
        }
    }
}
