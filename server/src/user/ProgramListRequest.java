package user;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Created by dillonbutt on 2016-03-20.
 */
public class ProgramListRequest extends HttpServlet
{
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException,ServletException
    {
        HttpSession session = request.getSession();

        String username = request.getParameter("username");

        List<String> loadRequest = new ProgramList().getProgramList(username);
        String result;
        if (loadRequest.equals(null))
        {
            result = "ERROR";
        }
        else
        {
            result="{\"programList\": [";
            for(String temp : loadRequest)
            {
                result+="\""+temp+"\",";

            }
            result = result.substring(0,result.length()-1);
            result+="]}";
        }
        PrintWriter out = response.getWriter();
        out.println(result);
    }
}
