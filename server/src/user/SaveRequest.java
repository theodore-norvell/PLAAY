package user;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

public class SaveRequest extends HttpServlet
{
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException,ServletException
    {
        HttpSession session = request.getSession();

        String username = request.getParameter("username");
        String programList = new SavePrograms().getProgramList(username);

        PrintWriter out = response.getWriter();
        out.println(programList);
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException
    {
        HttpSession session = request.getSession();

        String username = request.getParameter("username");
        String programName = request.getParameter("programname");
        String program = request.getParameter("program");

        String registerRequest = new SavePrograms().saveProgram(username,program,programName);
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
