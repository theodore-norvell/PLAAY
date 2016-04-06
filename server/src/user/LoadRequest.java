package user;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

public class LoadRequest extends HttpServlet
{
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException,ServletException
    {
        HttpSession session = request.getSession();

        String username = request.getParameter("username");
        String programName = request.getParameter("programname");

        String loadRequest = new LoadProgram().getProgram(username, programName);
        String result;
        if (loadRequest.equals("Error"))
        {
            result = "ERROR";
        }
        else
        {
            result = loadRequest;
        }
        PrintWriter out = response.getWriter();
        out.println(result);
    }
}
