// Removed UnorderedList import as it's no longer used
import { Box, Text } from "ink";
import { useState, useEffect } from "react";
import prompts from 'prompts';
import path from 'path';
import fs from 'fs-extra';
interface Expense {
    id: number;
    description: string;
    amount: number;
    category: Category;
}

enum ProgramState {
    Menu,
    View,
    Add,
    Update,
    Delete,
    Exit
}

enum Category {
    Food,
    Housing,
    Transport,
    Utilities,
    Entertainment,
    Education,
    Health,
    Other
}

const categories = Object.values(Category).filter((category) => typeof category === "string");

const initialExpenses: Expense[] = [
    {
        id: 1,
        description: 'Groceries',
        amount: 100,
        category: Category.Food
    },
    {
        id: 2,
        description: 'Housing',
        amount: 200,
        category: Category.Housing
    },
    {
        id: 3,
        description: 'Insurance',
        amount: 300,
        category: Category.Other
    }
]

const EXPENSES_FILE: string = path.join(process.cwd(), 'expenses.json');

export function Expense() {
    let [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
    const [state, setState] = useState<ProgramState>(ProgramState.Menu);
    const loadExpenses = async (): Promise<void> => {
        try {
            const fileExists: boolean = await fs.pathExists(EXPENSES_FILE);
            if (!fileExists) {
                console.log("File does not exist");
                return;
            }
            const data: string = await fs.readFile(EXPENSES_FILE, 'utf-8');
            expenses = JSON.parse(data);
            setExpenses(expenses);
        } catch (error) {
            console.error("Error loading expenses:", error);
        }
    }
    const saveExpenses = async (): Promise<void> => {
        try {
            await fs.writeJSON(EXPENSES_FILE, expenses, { spaces: 2 });
            console.log("Data saved successfully");
        } catch (error) {
            console.error('Error saving expenses:', error);
        }
    }
    const main = async () => {
        while(true){
            const response = await prompts({
                type: 'select',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    { title: 'View Expenses', value: ProgramState.View },
                    { title: 'Add Expense', value: ProgramState.Add },
                    { title: 'Update Expense', value: ProgramState.Update },
                    { title: 'Delete Expense', value: ProgramState.Delete },
                    { title: 'Exit', value: ProgramState.Exit }
                ]
            })
            if(response.action === ProgramState.Exit) {
                console.log('Goodbye!');
                return;
            }
            switch(response.action){
                case ProgramState.View:
                    setState(ProgramState.View);
                    break;
                case ProgramState.Add:
                    setState(ProgramState.Add);
                    const response = await prompts([
                        {
                            type: 'text',
                            name: 'description',
                            message: 'Enter expense description:',
                        }, 
                        {
                            type: 'number',
                            name: 'amount',
                            message: 'Enter expense amount:',
                        },
                        {
                            type: 'select',
                            name: 'category',
                            message: 'Select expense category:',
                            choices: categories.map((category) => ({
                                title: category as string,
                                value: Category[category as keyof typeof Category]
                            }))
                        }
                    ])

                    const newExpense: Expense = {
                        id: expenses.length + 1,
                        description: response.description,
                        amount: response.amount,
                        category: response.category
                    }
                    expenses.push(newExpense);
                    setExpenses(expenses);
                    await saveExpenses();
                    setState(ProgramState.Menu);
                    break;
                case ProgramState.Update:
                    const response1 = await prompts(
                        {
                            type: 'select',
                            name: 'id',
                            message: 'Select an expense to update:',
                            choices: expenses.map((expenses) => {
                                return {
                                    title: expenses.description,
                                    value: expenses.id
                                }
                            })
                        },
                    )
                    const expenseToUpdate = expenses.find((expenses) => expenses.id === response1.id);
                    if(expenseToUpdate){
                        const response2 = await prompts([
                            {
                                type: 'text',
                                name: 'description',
                                message: 'Enter expense description:',
                                initial: expenseToUpdate.description
                            }, 
                            {
                                type: 'number',
                                name: 'amount',
                                message: 'Enter expense amount:',
                                initial: expenseToUpdate.amount
                            },
                            {
                                type: 'select',
                                name: 'category',
                                message: 'Select expense category:',
                                choices: categories.map((category) => ({
                                    title: category as string,
                                    value: Category[category as keyof typeof Category]
                                })),
                                initial: expenseToUpdate.category
                            }
                        ])
                        expenseToUpdate.description = response2.description;
                        expenseToUpdate.amount = response2.amount;
                        expenseToUpdate.category = response2.category;
                        setExpenses(expenses);
                        await saveExpenses();
                        setState(ProgramState.Menu);
                    }
                    setState(ProgramState.Update);
                    break;
                case ProgramState.Delete:
                    const response3 = await prompts({
                        type: 'select',
                        name: 'id',
                        message: 'Select an expense to delete:',
                        choices: expenses.map((expense) => {
                            return {
                                title: expense.description,
                                value: expense.id
                            }
                        })
                    })
                    const expenseToDelete = expenses.find((expense) => expense.id === response3.id);
                    if(expenseToDelete){
                        expenses.splice(expenses.indexOf(expenseToDelete), 1);
                        setExpenses(expenses);
                        await saveExpenses();
                        setState(ProgramState.Menu);
                    }
                    setState(ProgramState.Delete);
                    break;
                default:
                    setState(ProgramState.Menu);
                    break;
            }
        }
    }

    useEffect(() => {
        loadExpenses();
        main();
    }, []);
    return (
        <>
            <Box flexDirection="column" borderStyle="round" borderColor="blue" paddingX={1} >
                <Box paddingBottom={1}>
                    <Text bold >Expenses</Text>
                </Box>
                {state === ProgramState.View && expenses.length > 0 && 
                <>
                    <Box borderStyle="single" borderColor="gray" paddingX={1}>
                        <Box width="100%" flexDirection="row">
                            <Box width={8}>
                                <Text bold color="cyan">ID</Text>
                            </Box>
                            <Box width={25}>
                                <Text bold color="cyan">Description</Text>
                            </Box>
                            <Box width={12}>
                                <Text bold color="cyan">Amount</Text>
                            </Box>
                            <Box width={15}>
                                <Text bold color="cyan">Category</Text>
                            </Box>
                        </Box>
                    </Box>
                    
                    {expenses.map((expense) => (
                        <Box 
                            key={expense.id} 
                            borderStyle="single" 
                            borderColor="gray" 
                            paddingX={1}
                        >
                            <Box width="100%" flexDirection="row">
                                <Box width={8}>
                                    <Text>{expense.id}</Text>
                                </Box>
                                <Box width={25}>
                                    <Text>{expense.description.length > 22 ? expense.description.substring(0, 22) + '...' : expense.description}</Text>
                                </Box>
                                <Box width={12}>
                                    <Text color="green">R{expense.amount.toFixed(2)}</Text>
                                </Box>
                                <Box width={15}>
                                    <Text color="yellow">{categories[expense.category]}</Text>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                    
                    <Box borderStyle="double" borderColor="blue" paddingX={1} marginTop={1}>
                        <Box width="100%" flexDirection="row">
                            <Box width={45}>
                                <Text bold color="blue">TOTAL</Text>
                            </Box>
                            <Box width={12}>
                                <Text bold color="green">R{expenses.reduce((total, expense) => total + expense.amount, 0).toFixed(2)}</Text>
                            </Box>
                        </Box>
                    </Box>
                </>
                }
                {state === ProgramState.Add && <Box>
                    <Text bold >Add Expense</Text>
                </Box>}
            </Box>
        </>
    )
}