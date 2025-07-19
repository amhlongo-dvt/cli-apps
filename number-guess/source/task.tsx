import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import prompts from "prompts";
interface Task {
    id: number;
    description: string;
    status: TaskState;
    createdAt: Date;
    updatedAt: Date;
}

enum TaskState{
    Todo,
    InProgess,
    Done
}

enum ProgramState {
    Menu,
    Add,
    UpdateDescription,
    UpdateStatus,
    Delete,
    View,
    Exit
}
const initialTasks: Task[] = [
    {
        id: 1,
        description: 'Task 1',
        status: TaskState.Todo,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        description: 'Task 2',
        status: TaskState.Todo,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 3,
        description: 'Task 3',
        status: TaskState.InProgess,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// function addTask(task: Task, tasks: Task[]): Task[] {
//     return [...tasks, task];
// }

// function deleteTask(id: number, tasks: Task[]): Task[] {
//     return tasks.filter(task => task.id !== id);
// }

// function updateTask(id: number, task: Task, tasks: Task[]): Task[] {
//     return tasks.map(task => task.id === id ? task : task);
// }



export  function Task() {
    let [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [programState, setProgramState] = useState<ProgramState>(ProgramState.Menu);

    async function main() {
        while(true) {
            const response = await prompts({
                    type: 'select',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: [
                    { title: 'View Tasks', value: ProgramState.View },
                    { title: 'Add Task', value: ProgramState.Add },
                    { title: 'Update Task Description', value: ProgramState.UpdateDescription },
                    { title: 'Update Task Status', value: ProgramState.UpdateStatus },
                    { title: 'Delete Task', value: ProgramState.Delete },
                    { title: 'Exit', value: ProgramState.Exit }
                ]
            });
            if(programState === ProgramState.View && response.action === ProgramState.View) {
                continue;
            }
            if(response.action === ProgramState.Exit) {
                return;
            }
            if(response.action === ProgramState.Add) {
                const taskResponse = await prompts({
                    type: 'text',
                    name: 'task',
                    message: 'Enter task description:',
                    validate: (value: string) => value.trim() ? true : 'Task cannot be empty'
                });
                if(!taskResponse.task) continue;
                const newTask: Task = {
                    id: tasks.length + 1,
                    description: taskResponse.task,
                    status: TaskState.Todo,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                tasks.push(newTask);
                setTasks(tasks);
                console.log(tasks);
                setProgramState(ProgramState.View);
            }
            if(response.action === ProgramState.UpdateDescription) {
                if(tasks.length === 0){
                    console.log('There are no tasks');
                    continue;
                }
                const taskResponse = await prompts({
                    type: 'select',
                    name: 'task',
                    message: 'Select task to update:',
                    choices: tasks.map(task => ({
                        title: task.description,
                        value: task.id
                    }))
                });
                if(!taskResponse.task) continue;
                const task = tasks.find(task => task.id === taskResponse.task);
                if(!task) continue;
        
                const updateDescription = await prompts({
                    type: 'text',
                    name: 'description',
                    message: 'Please enter the description',
                    validate: (value: string) => value.trim() ? true : 'Task cannot be empty'
                })

                const newTask: Task = {
                    id: task.id,
                    description: updateDescription.description,
                    status: task.status,
                    createdAt: task.createdAt,
                    updatedAt: new Date()
                };
                tasks = tasks.map(task => task.id === taskResponse.task ? newTask : task)
                console.log(tasks);
                setTasks(tasks);
                setProgramState(ProgramState.View);
            }
            if(response.action === ProgramState.UpdateStatus){
                if(tasks.length === 0){
                    console.log('There are no tasks');
                    continue;
                }
                const taskResponse = await prompts({
                    type: 'select',
                    name: 'task',
                    message: 'Select task to update:',
                    choices: tasks.map(task => ({
                        title: task.description,
                        value: task.id
                    }))
                });
                if(!taskResponse.task) continue;
                const task = tasks.find(task => task.id === taskResponse.task);
                if(!task) continue;
        
                const updateStatus = await prompts({
                    type: 'select',
                    name: 'status',
                    message: 'Please select status',
                    choices: [
                        { title: 'To Do', value:  TaskState.Todo},
                        { title: 'In Progress', value: TaskState.InProgess },
                        { title: 'Done', value: TaskState.Done }
                    ]
                })
        
                const newTask: Task = {
                    id: task.id,
                    description: task.description,
                    status: updateStatus.status,
                    createdAt: task.createdAt,
                    updatedAt: new Date()
                };
                tasks = tasks.map(task => task.id === taskResponse.task ? newTask : task)
                console.log(tasks);
                setTasks(tasks);
                setProgramState(ProgramState.View);
            }
            if(response.action === ProgramState.Delete){
                if(tasks.length === 0){
                    console.log('There are no tasks');
                    continue;
                }
                const deleteResponse = await prompts({
                    type: 'select',
                    name: 'task',
                    message: 'Select task to delete:',
                    choices: tasks.map(task => ({
                        title: task.description,
                        value: task.id
                    })),
                });
                if(!deleteResponse.task) continue;
                tasks = tasks.filter(task => task.id !== deleteResponse.task);
                console.log(tasks);
                setTasks(tasks);
                setProgramState(ProgramState.View);
            }
            setProgramState(response.action);
    }}
    
    
    useEffect(() => {
       main()
    }, []);


    return (
        <>
            {programState === ProgramState.View && (
                <Box flexDirection="column">
                    {tasks.map(task => (
                        <Box key={task.id}>
                            <Text>{task.description}</Text>
                            <Text>{task.status}</Text>
                            <Text>{task.createdAt.toDateString()}</Text>
                            <Text>{task.updatedAt.toDateString()}</Text>
                        </Box>
                    ))}
                </Box>
            )}
        </>
    );
}