package user;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

public class EditRequest extends HttpServlet
{
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException
    {
        HttpSession session = request.getSession();

        String username = request.getParameter("username");
        String oldpassword = request.getParameter("oldpassword");
        String newpassword = request.getParameter("newpassword");
        String email = request.getParameter("email");


        String registerRequest = new RegisterUser().register(username,newpassword);
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
