package user;

import java.io.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.security.*;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.PutItemOutcome;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.model.AttributeDefinition;
import com.amazonaws.services.dynamodbv2.model.KeySchemaElement;
import com.amazonaws.services.dynamodbv2.model.KeyType;
import com.amazonaws.services.dynamodbv2.model.ProvisionedThroughput;
import com.amazonaws.services.dynamodbv2.model.ScalarAttributeType;

@WebServlet("/register")
public class RegisterRequest extends HttpServlet
{
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException
    {
        HttpSession session = request.getSession();

        String username = request.getParameter("username");
        String pword = request.getParameter("password");

        String registerRequest = new RegisterUser().register(username,pword);
        String result = "";
        if (registerRequest.equals("Success"))
        {
            result = "{\"username\": \""+username+"\",\n" +
                    "\"result\": \"SUCCESS\"}";
        }
        else if (registerRequest.equals("NameTaken"))
        {
            result = "{\"username\": \"null\",\n" +
                    "\"result\": \"NAMETAKEN\"}";
        }
        else if (registerRequest.equals("Error"))
        {
            result = "{\"username\": \"null\",\n" +
                    "\"result\": \"ERROR\"}";
        }

        session.setAttribute("loggedInUserId",username);

        PrintWriter out = response.getWriter();
        //out.println(username);
        //out.println(pword);
        out.println(result);

    }
}
