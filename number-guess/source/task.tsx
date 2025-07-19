import {  Text } from "ink";
import { useEffect, useState } from "react";
import prompts from "prompts";
import { UnorderedList } from "@inkjs/ui";
import path from 'path';
import fs from 'fs-extra';
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

const TASKS_FILE: string = path.join(process.cwd(), 'tasks.json');

export  function Task() {
    let [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [programState, setProgramState] = useState<ProgramState>(ProgramState.Menu);
    const loadTasks = async (): Promise<void> => {
        try {
            const fileExists: boolean = await fs.pathExists(TASKS_FILE);
            if (!fileExists) {
                console.log("File does not exist");
                return;
            }
            const data: Task[] = await fs.readJson(TASKS_FILE);
            // Convert date strings back to Date objects
            const tasksWithDates = data.map(task => ({
                ...task,
                createdAt: new Date(task.createdAt),
                updatedAt: new Date(task.updatedAt)
            }));
            console.log("Data loaded successfully");
            tasks = tasksWithDates;
            setTasks(tasksWithDates);
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    const saveTasks = async (): Promise<void> => {
        try {
            await fs.writeJSON(TASKS_FILE, tasks, { spaces: 2 });
            console.log("Data saved successfully");
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    };

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
            
            // Handle cancelled prompt (Escape key)
            if (response.action === undefined) {
                return;
            }
            
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
                if(!taskResponse.task || taskResponse.task === undefined) continue;
                const newTask: Task = {
                    id: tasks.length + 1,
                    description: taskResponse.task,
                    status: TaskState.Todo,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                tasks.push(newTask);
                setTasks(tasks);
                saveTasks();                
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

                if(!updateDescription.description || updateDescription.description === undefined) continue;

                const newTask: Task = {
                    id: task.id,
                    description: updateDescription.description,
                    status: task.status,
                    createdAt: task.createdAt,
                    updatedAt: new Date()
                };
                tasks = tasks.map(task => task.id === taskResponse.task ? newTask : task)
                
                setTasks(tasks);
                saveTasks();
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

                if(updateStatus.status === undefined) continue;
        
                const newTask: Task = {
                    id: task.id,
                    description: task.description,
                    status: updateStatus.status,
                    createdAt: task.createdAt,
                    updatedAt: new Date()
                };
                tasks = tasks.map(task => task.id === taskResponse.task ? newTask : task)
                
                setTasks(tasks);
                saveTasks();
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
                
                setTasks(tasks);
                saveTasks();
                setProgramState(ProgramState.View);
            }
            setProgramState(response.action);
    }}
    
    
    useEffect(() => {
        const initializeApp = async () => {
            await loadTasks();
            main();
        };
        initializeApp();
    }, []);


    return (
        <>
            {programState === ProgramState.View && (
                <UnorderedList>
                    {tasks.map(task => (
                        <UnorderedList.Item key={task.id}>
                            <Text color="cyan">{task.description}</Text>
                            <Text color={task.status == TaskState.Done ?"green":"white"}>{task.status===TaskState.Todo? 'To Do': task.status===TaskState.InProgess? 'In Progress': 'Done'}</Text>
                            <Text color="blue">{task.createdAt.toDateString()}</Text>
                            <Text color="blue">{task.updatedAt.toDateString()}</Text>
                        </UnorderedList.Item>
                    ))}
                </UnorderedList>
            )}
        </>
    );
}