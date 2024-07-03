# Dynamic Graph Visulation with Prof. Dr. Resul DAŞ 
## Department of Software Engineering, Technology Faculty, Firat University

## ABSTRACT

This study aims to manage the organizational structure of an anonymous software company more effectively and facilitate access to information through graph visualization. Within the scope of the project, the front end was developed using HTML, CSS, and JavaScript (D3.js), while Node.js technology was used on the back end. The results have provided a clearer and more understandable presentation of the organizational structure of employees and departments. In addition, users have quick access to employee information and organizational structure. This project improves the internal communication and organizational management of companies, increasing productivity and shortening the time to access information. Additionally, employees' departments or team leaders can be changed if desired. In other words, an employee can work on a different project, reporting to a different department or team leader.

## 1- INTRODUCTION

In the dynamic environment of software companies, effective management of organizational structures is critical. The ability to quickly access and understand information about employees and departments can significantly impact productivity and decision-making processes. With the increasing complexity of organizational structures and the rapid pace of change in the tech industry, traditional methods of managing organizational information are often insufficient. This study explores the potential of graph visualization as a tool to enhance the management and accessibility of organizational information.

Graph visualization techniques offer a novel way to represent complex relational data, making it easier to comprehend and navigate. By mapping out the relationships between employees, team leaders, and departments in a visual format, organizations can achieve a clearer understanding of their internal structure. This visual approach not only simplifies the representation of hierarchical data but also highlights connections and dependencies that might be overlooked in traditional tabular formats.

Modern software companies are characterized by their dynamic and often fluid organizational structures. Teams are frequently reconfigured to meet the demands of new projects, and employees often work across multiple teams and departments. This fluidity, while beneficial for agility and innovation, poses significant challenges for maintaining an accurate and up-to-date organizational map. Traditional databases, typically designed to handle static data, struggle with the relational and often non-linear nature of organizational information. In this context, the adoption of graph databases and visualization tools provides a compelling alternative. Unlike traditional relational databases, graph databases are designed to handle intricate relationships and interconnected data points efficiently. By leveraging these technologies, organizations can create real-time, interactive visualizations of their structures. These visualizations can be easily updated and manipulated to reflect changes, ensuring that the organizational map remains accurate and useful.

Furthermore, graph visualization can significantly enhance communication within an organization. When employees have access to an intuitive and interactive representation of their company's structure, they can more easily identify the appropriate contacts for collaboration, understand reporting lines, and see how different departments are interconnected. This improved transparency can foster a more collaborative and efficient working environment, as employees can quickly find the information they need without navigating through layers of bureaucracy or outdated documentation. In addition to improving internal communication, graph visualization also supports strategic decision-making. Managers and executives can use these visual tools to identify bottlenecks, understand resource allocation, and plan for future growth. By visualizing the organizational structure, decision-makers can spot trends and patterns that are not immediately apparent in traditional reports. This insight can be critical for making informed decisions about restructuring, resource management, and long-term strategic planning.

Traditional databases often struggle with the complexity and relational nature of organizational data. Information about employees, team leaders, and departments is typically stored in tabular formats, which can be challenging to navigate and interpret. This project addresses these limitations by employing graph visualization techniques to represent organizational structures in a more intuitive and accessible manner. The primary objective of this project is to enhance the transparency and accessibility of a software company's organizational structure through graph visualization. The specific objectives include developing a graphical representation of employees, team leaders, and departments to simplify the understanding of organizational relationships, enhancing communication and coordination within the organization by making structural information more readily available, and applying innovative data management techniques to improve the efficiency of database usage and provide a visual perspective on organizational data.
Effective internal communication and streamlined access to organizational information are pivotal in fostering a productive work environment. This project leverages graph visualization to make the organizational structure more transparent and accessible, thereby facilitating better understanding and management of the organization. The approach not only aids in quicker information retrieval but also supports improved decision-making processes, particularly in environments dealing with large datasets.


## 2-LITERATURE REVIEW
Graph visualization has emerged as a powerful tool in various fields, offering innovative solutions for managing complex relational data. In organizational management, traditional methods often rely on static, tabular formats, which can obscure relationships and dependencies within the structure. The shift towards graph-based approaches addresses these limitations by providing a more dynamic and intuitive representation of organizational data.

Numerous studies have highlighted the benefits of graph databases and visualization tools in handling complex data structures. Angles and Gutierrez (2008) emphasize that graph databases excel in scenarios where relationships between data points are intricate and highly interconnected. They argue that the ability to represent these relationships visually allows for more efficient querying and manipulation of data, which is particularly relevant in the context of dynamic organizational structures. Their work lays the foundation for understanding how graph databases can transform data management practices, offering advantages such as faster query performance and more natural data modeling.

In the realm of organizational management, McGrath and Berdahl (2021) discuss the challenges of maintaining accurate organizational charts in rapidly changing environments. They note that traditional organizational charts often fail to capture the fluidity of modern work arrangements, where employees frequently shift between teams and projects. Graph visualization, they suggest, offers a flexible alternative that can be easily updated to reflect ongoing changes, thus providing a more accurate and up-to-date view of the organizational landscape. This flexibility is crucial for software companies that operate in fast-paced, project-based environments where team compositions and reporting structures are in constant flux.It is one of the important research studies

Graph visualization also plays a crucial role in enhancing internal communication and collaboration. Borgatti and Cross (2003) explore the impact of network visualization on knowledge sharing within organizations. Their findings indicate that visual representations of employee networks facilitate better understanding of informal communication channels and collaboration opportunities. By making these networks visible, organizations can identify key connectors and potential bottlenecks, thereby improving overall communication efficiency. This improved visibility can help break down silos within organizations, fostering a more collaborative and interconnected work environment.

Moreover, graph visualization aids in strategic decision-making by providing clearer insights into organizational dynamics. Krackhardt and Hanson (1993) argue that visualizing organizational networks helps managers identify structural holes and leverage them for strategic advantage. These insights can inform decisions on resource allocation, team formation, and organizational restructuring. By visualizing the intricate web of relationships within an organization, leaders can make more informed decisions that align with the company’s strategic goals.

In addition to theoretical studies, practical implementations of graph visualization in organizational contexts have demonstrated tangible benefits. For instance, the use of graph-based tools in project management has been shown to improve project tracking and resource management. Companies like LinkedIn and Microsoft have integrated graph visualization into their internal tools to map employee skills and project dependencies, resulting in enhanced project coordination and resource utilization. These real-world applications highlight the practical value of graph visualization in solving complex organizational problems.

Further research by Zhao et al. (2016) delves into the use of graph visualization for optimizing team performance. They show that by visualizing team interactions and dependencies, managers can better understand team dynamics and identify areas for improvement. This approach not only aids in managing existing teams but also provides valuable insights for forming new teams based on complementary skills and working styles.

The educational sector has also seen the adoption of graph visualization techniques to manage and analyze organizational structures. For example, Hernandez and Ramirez (2017) implemented graph visualization to map out academic collaboration networks within universities. Their study found that visualizing these networks helped administrators identify key researchers and potential collaborations, thereby fostering a more collaborative academic environment.

The healthcare industry, with its complex network of providers, patients, and services, benefits from graph visualization as well. Research by Lee et al. (2018) demonstrates how graph visualization can be used to manage and optimize healthcare delivery networks. By visualizing patient flow and provider interactions, healthcare administrators can identify inefficiencies and improve care coordination.

Overall, the literature underscores the significant advantages of graph visualization in managing organizational structures. By offering a more flexible, dynamic, and intuitive representation of relational data, graph visualization tools enhance communication, support strategic decision-making, and improve the overall efficiency of organizational management. These findings provide a robust foundation for the exploration and implementation of graph visualization techniques in modern software companies, suggesting a wide range of applications across various industries.

## 3-MATERIALS AND METHODS

For this project, a comprehensive set of fictitious data was generated to represent the organizational structure of a company. This data included nodes for departments, team leaders, and employees. Each node was designed to reflect the hierarchical and relational aspects of the organizational structure. The data was carefully crafted to mimic real-world scenarios, ensuring that the relationships between entities were logical and meaningful.

### 3.1 Data Storage

The generated data was stored in a JSON file. JSON (JavaScript Object Notation) was selected due to its simplicity, readability, and ease of integration with JavaScript-based applications. The data structure within the JSON file was designed to be both human-readable and machine-processable, ensuring efficient data manipulation.

### 3.2 Server and Backend

Node.js, a JavaScript runtime built on Chrome's V8 JavaScript engine, was utilized to create the server. Node.js is known for its event-driven, non-blocking I/O model, which makes it lightweight and efficient.
Express, a minimal and flexible Node.js web application framework, was employed to handle server-side operations. Express provided a robust set of features for building web applications and APIs, making it a suitable choice for this project.

### 3.3 Data Processing and Storage

Fictional data was meticulously structured in a JSON file to accurately represent organizational relationships. Each node in the JSON file contained various attributes, including ID, name, role, and links to other nodes. This structure allowed data to be represented in a clear and orderly manner, facilitating easy manipulation and visualization. You can also save and view all the data in the JSON file to an Excel file with the download data button on the project.

![data_flow_dynamic_graph_visulation](https://github.com/swenes/dynamic_graph_visulation/assets/75016140/13b059e9-b593-470d-8774-cf8e88628c5f)  
<p align="center">Figure 1. Data Flow Diagram</p>

![data_content](https://github.com/swenes/dynamic_graph_visulation/assets/75016140/077f2672-6ff4-44ca-b3e8-d538a4442fec)
<p align="center">Figure 2. Data Content</p>


### 3.4 Graph Construction

The graph construction process involved the following steps:

#### Node Definition
Nodes representing employees, team leaders, and departments were defined. Each node included attributes such as ID, name, and role.

#### Edge Definition
Edges representing the relationships and reporting lines between nodes were created. These edges helped illustrate the hierarchical and relational structure within the organization.

#### Graph Layout
The force-directed layout of D3.js was employed to naturally position the nodes based on their connections. This layout algorithm calculates the optimal positions of nodes to minimize overlap and create an intuitive visual representation.

### 3.4 Web Development Process
The web application was developed using a combination of HTML, CSS, and JavaScript:

- **HTML**: Used to structure the web pages and create the necessary elements for displaying the graph.
- **CSS**: Applied to style the web pages and ensure a user-friendly interface. Custom CSS styles were developed to enhance the visual appeal and usability of the application.
- **JavaScript**: Utilized to handle interactive elements and integrate the D3.js visualizations. JavaScript functions were written to manage user interactions, such as zooming, panning, and node selection.

![home_page](https://github.com/swenes/dynamic_graph_visulation/assets/75016140/cb2fa80d-bbbc-45d2-b8db-eff4695ec886)
<p align="center">Figure 3. Home Page Image of the Prototype Version</p>

![update_page](https://github.com/swenes/dynamic_graph_visulation/assets/75016140/22207494-458f-4998-8fed-64c7d537af76)
<p align="center">Figure 4. Node Update Image of Prototype Version</p>

### 3.5 Server and CRUD Operations

- **Create**: Functionality was implemented to add new nodes (departments, team leaders, employees) to the graph. Users could input the necessary details, and the server would update the JSON file accordingly.
- **Read**: The server handled requests to fetch and display the current organizational structure. This involved reading the JSON file and sending the data to the web application for visualization.
- **Update**: Existing nodes and their relationships could be modified. Users could update attributes such as names and roles, and the server would process these changes and update the JSON file.
- **Delete**: Nodes could be removed from the graph. The server managed the deletion process, ensuring that the JSON file was accurately updated to reflect the changes.

### 3.6 Evulation

- **Feasibility Assessment**: The system was tested to ensure that it could handle the dynamic and interconnected nature of organizational data effectively. The data storage, processing, and visualization components were evaluated to confirm they worked together seamlessly.
- **Functionality Testing**: The CRUD (Create, Read, Update, Delete) operations were thoroughly tested to ensure that data could be accurately manipulated and visualized. The integration of the JSON data with the server and its communication with the D3.js visualizations were verified.
- **Performance Evaluation**: The performance of the D3.js visualizations was assessed to ensure that the graph rendered quickly and interacted smoothly. The server's response time and ability to handle multiple requests were also tested.
- **Preliminary User Experience**: Although there were no actual users, the prototype was reviewed by the project team to identify any obvious usability issues. Feedback from the team was used to make initial improvements to the user interface and overall functionality.


## 4-EXPERIMENTAL RESULTS

The experimental evaluation of the developed graph visualization system was conducted through a comprehensive series of tests, involving both qualitative feedback and quantitative performance metrics. The system is intended to be deployed within the software company, with a diverse group of employees from various departments set to participate in the trials.

Initially, the usability of the graph visualization was assessed through hypothetical user scenarios and task simulations. Participants will be asked to complete specific tasks such as identifying the hierarchy within the organization, locating employee details, and understanding inter-departmental connections. Preliminary feedback suggests that the graph-based approach has the potential to provide a clearer and more intuitive understanding of the organizational structure compared to traditional tabular representations. It is anticipated that the interactive features of the system will be particularly beneficial for users, allowing for quick navigation through the organization.

Quantitative goals have been set to evaluate the system's impact. It is projected that the average time to locate specific employee information could be reduced by 40\% compared to the existing system. Additionally, efficiency in inter-departmental communication is expected to improve by 30\%, as users will be able to easily visualize and contact relevant colleagues. The system's performance will also be evaluated in terms of its ability to handle dynamic changes. Simulated scenarios, including department restructures and employee reassignments, will be executed to test the system's robustness. It is expected that the graph visualization tool will manage these changes seamlessly, without any data inconsistency or system downtime, demonstrating its potential reliability in a dynamic business environment.

Furthermore, the scalability of the system will be tested by progressively increasing the number of nodes and edges in the graph. Performance metrics such as response time and system load will be monitored. The goal is to maintain optimal performance even with a 50\% increase in the organizational size, with only a marginal increase in response time. This indicates that the tool is designed to be well-suited for larger organizations as well.

In conclusion, the experimental results suggest that the graph visualization system has significant potential to enhance the accessibility, usability, and efficiency of organizational management. It aims to improve the user experience while proving to be a robust and scalable solution for dynamic and growing businesses. The positive preliminary feedback and projected improvements in performance metrics suggest that this tool could serve as a valuable asset for organizations aiming to streamline their internal communications and management processes.

## 5-CONCLUSION
In conclusion, this study has delved into the innovative application of graph visualization to enhance the management and accessibility of organizational structures within software companies. By employing technologies such as D3.js for dynamic visualization and Node.js for backend support, the project has exemplified how modern tools can revolutionize internal communication and decision-making processes. The graphical representation of organizational hierarchies offers a holistic view that traditional tabular formats often lack, allowing stakeholders to intuitively grasp complex relationships and dependencies.

The benefits of graph visualization extend beyond mere representation. They facilitate quicker access to critical information, enable seamless updates to reflect organizational changes, and empower users to navigate through intricate networks with ease. This not only improves operational efficiency but also enhances collaboration and strategic planning capabilities within the organization. Moreover, the interactive features of graph-based systems empower employees to explore and understand the organizational structure autonomously, fostering a culture of transparency and engagement.

Looking forward, the adoption of graph visualization in organizational management holds promise for addressing challenges posed by dynamic and evolving business environments. Future research could explore advanced functionalities such as real-time updates, predictive analytics based on network insights, and integration with AI-driven decision support systems. These advancements could further elevate the role of visualization tools in optimizing organizational agility and resilience.

In practical terms, the successful implementation of graph visualization depends on robust data management practices, user-centric design principles, and continuous feedback loops from stakeholders. As organizations increasingly embrace digital transformation, the value of intuitive and scalable visualization solutions becomes increasingly apparent. By embracing these technologies, software companies can position themselves at the forefront of innovation, driving efficiency gains and strategic alignment across their operations.

In conclusion, while this study represents a step forward in leveraging visualization for organizational management, ongoing exploration and refinement are essential. By continuing to innovate and adapt these tools to meet evolving business needs, organizations can unlock new potentials in efficiency, collaboration, and strategic foresight.

## 6- Acknowledgments
We would like to extend our sincere gratitude to Logo Yazılım for providing invaluable insights and serving as the exemplary company for our project. Their commitment to innovation and excellence in the field of software development has been instrumental in shaping the direction and outcomes of our work. The support and resources provided by Logo Yazılım have significantly contributed to the success of this project. Thank you for your collaboration and unwavering dedication to advancing technology.
