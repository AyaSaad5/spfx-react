// import { IEmployee } from '../Models/IEmployee';

import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import "@pnp/sp/folders";
import "@pnp/sp/files";
import "@pnp/sp/sites";
import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { useState } from 'react';
import { IEmployee } from '../Models/IEmployee';
import { Label, PrimaryButton, TextField } from '@fluentui/react';
import useFetchData from '../customHooks/useFetch';
import { addEmployee, deleteEmployee, updateEmployee } from '../services/EmployeeService';


export default function EmpolyeeList() {

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<{ id: number; profilePictureUrl: string } | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null);
    const [employeeId, setEmployeeId] = useState<number | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [employeeName, setEmployeeName] = useState("");
    const [employeeJobTitle, setEmployeeJobTitle] = useState("");
    const [employeeDepartment, setEmployeeDepartment] = useState("");
    const [employeeEmail, setEmployeeEmail] = useState("");
    const { data, loading, error, refetch } = useFetchData<IEmployee[]>('EmpList')
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);


    const handleSubmit = async () => {
        if (loading) {
            return (
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }
        if (error) {
            return <div>Error: {error}</div>;
        }
        if (!file) {
            alert("Please upload a profile picture.");
            return;
        }

        try {
            await addEmployee({
                Title: employeeName,
                JobTitle: employeeJobTitle,
                Department: employeeDepartment,
                Email: employeeEmail
            }, file)

            // Clear form
            setEmployeeName('');
            setEmployeeJobTitle('');
            setEmployeeDepartment('');
            setEmployeeEmail('');
            setFile(null);
            fileInputRef.current && (fileInputRef.current.value = '');

            refetch()

        } catch (error) {
            console.error("Error adding employee:", error);
            alert("Error adding employee. Check console.");
        }

    };

    const filterdData = data?.filter(emp => {
        const query = searchQuery.toLowerCase();
        return (
            emp.Title.toLowerCase().includes(query) ||
            emp.Department.toLowerCase().includes(query) ||
            emp.JobTitle.toLowerCase().includes(query)

        )
    })


    const updateItem = async () => {

        if (employeeId) {
            await updateEmployee(
                employeeId,
                {
                    Title: employeeName,
                    JobTitle: employeeJobTitle,
                    Department: employeeDepartment,
                    Email: employeeEmail
                },
                file!,
                data?.find(emp => emp.Id === employeeId)?.ProfilePictureUrl
            );

            setEmployeeId(null);
            setEmployeeJobTitle('');
            setEmployeeDepartment('');
            setEmployeeEmail('');
            setEmployeeName('')
            setFile(null);
            fileInputRef.current && (fileInputRef.current.value = '');
            refetch()
        }
    }

    const editItem = (item: IEmployee) => {
        setEmployeeName(item.Title);
        setEmployeeJobTitle(item.JobTitle);
        setEmployeeDepartment(item.Department);
        setEmployeeEmail(item.Email)
        setEmployeeId(item.Id!)

        const profilePicData = JSON.parse(item.ProfilePictureUrl)
        console.log(profilePicData.fileName)
        if (profilePicData.fileName) {
            setFile(new File([], profilePicData.fileName)); // Handle file input for editing
        }
        console.log(employeeId)
    };


    // const deleteItem = async (id: number, profilePictureUrl: string) => {
    //     const isConfirmed = window.confirm(`Are you sure you want to delete this employee and their profile picture?`);
    //     if (!isConfirmed) return;

    //     await deleteEmployee(id, profilePictureUrl)

    //     refetch()

    // }

    const requestDelete = (id: number, profilePictureUrl: string) => {
        setEmployeeToDelete({ id, profilePictureUrl });
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return;

        await deleteEmployee(employeeToDelete.id, employeeToDelete.profilePictureUrl);
        refetch();
        setIsDeleteDialogOpen(false);
        setEmployeeToDelete(null);
    };
    const gridStyles: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        padding: '20px'
    };

    const cardStyles: React.CSSProperties = {
        border: '1px solid #ccc',
        borderRadius: '12px',
        padding: '16px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    };

    const imageStyles: React.CSSProperties = {
        width: '100px',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '50%',
        marginBottom: '12px'
    };




    return (

        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Add Employee</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <TextField
                    label="Name"
                    value={employeeName}
                    onChange={(_, v) => setEmployeeName(v || '')}
                />
                <TextField
                    label="Job Title"
                    value={employeeJobTitle}
                    onChange={(_, v) => setEmployeeJobTitle(v || '')}
                />
                <TextField
                    label="Department"
                    value={employeeDepartment}
                    onChange={(_, v) => setEmployeeDepartment(v || '')}
                />
                <TextField
                    label="Email"
                    value={employeeEmail}
                    onChange={(_, v) => setEmployeeEmail(v || '')}
                />

                <div>
                    <Label style={{ marginBottom: '4px' }}>Profile Picture</Label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        style={{
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            width: '100%'
                        }}
                    />
                </div>

                <PrimaryButton
                    text={employeeId ? 'Update' : 'Add'}
                    onClick={employeeId ? updateItem : handleSubmit}
                    style={{
                        alignSelf: 'flex-end',
                        marginTop: '16px',
                        backgroundColor: '#0078D4',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '6px'
                    }}
                />
            </div>

            {loading && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        zIndex: 9999,
                    }}
                >
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {error && <div style={{ color: 'red', marginTop: '12px' }}>Error: {error}</div>}


            <div>
                <div style={{ margin: '20px 0' }}>
                    <TextField
                        label="Search Employees"
                        placeholder="Type name, job title or department..."
                        value={searchQuery}
                        onChange={(_, v) => setSearchQuery(v || '')}
                    />
                </div>
                <h2>Employee Directory</h2>
                <div style={gridStyles}>
                    {filterdData?.map((emp, index) => {
                        let imageUrl = "https://via.placeholder.com/100"; // default
                        try {
                            const profileData = JSON.parse(emp.ProfilePictureUrl);
                            console.log(profileData)
                            if (profileData?.fileName) {
                                imageUrl = `https://quadintelligence.sharepoint.com/sites/AyaSite/SiteAssets/${profileData.fileName}`;
                            }
                        } catch (err) {
                            console.warn("Invalid image data for", emp.Title);
                        }

                        return (
                            <div key={index} style={cardStyles}>
                                <img
                                    src={imageUrl}
                                    alt={emp.Title}
                                    style={imageStyles}
                                />
                                <h3>{emp.Title}</h3>
                                <p>{emp.JobTitle}</p>
                                <p>{emp.Department}</p>
                                <p>{emp.Email}</p>

                                <div>
                                    <button
                                        onClick={() => editItem(emp)}
                                        className="btn btn-success"
                                        style={{
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            padding: '6px 12px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginRight: '8px'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => requestDelete(emp.Id!, emp.ProfilePictureUrl)}
                                        className="btn btn-danger"
                                        style={{
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            padding: '6px 12px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginRight: '8px'
                                        }}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedEmployee(emp);
                                            setIsDialogOpen(true);
                                        }}
                                        style={{
                                            backgroundColor: '#0078D4',
                                            color: 'white',
                                            padding: '6px 12px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginRight: '8px'
                                        }}
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>


            <Dialog
                hidden={!isDialogOpen}
                onDismiss={() => setIsDialogOpen(false)}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: selectedEmployee?.Title,
                    subText: 'Employee Details',
                }}
            >
                {selectedEmployee && (
                    <div>
                        <img
                            src={
                                selectedEmployee.ProfilePictureUrl
                                    ? `https://quadintelligence.sharepoint.com/sites/AyaSite/SiteAssets/${JSON.parse(selectedEmployee.ProfilePictureUrl)?.fileName || ''
                                    }`
                                    : 'https://via.placeholder.com/100'
                            }
                            alt={selectedEmployee.Title}
                            style={{ width: '120px', borderRadius: '8px', marginBottom: '12px' }}
                        />
                        <p><strong>Job Title:</strong> {selectedEmployee.JobTitle}</p>
                        <p><strong>Department:</strong> {selectedEmployee.Department}</p>
                        <p><strong>Email:</strong> {selectedEmployee.Email}</p>
                    </div>
                )}
                <DialogFooter>
                    <DefaultButton onClick={() => setIsDialogOpen(false)} text="Close" />
                </DialogFooter>
            </Dialog>
            <Dialog
                hidden={!isDeleteDialogOpen}
                onDismiss={() => setIsDeleteDialogOpen(false)}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: "Confirm Deletion",
                    subText: "Are you sure you want to delete this employee and their profile picture?",
                }}
            >
                <DialogFooter>
                    <PrimaryButton onClick={confirmDelete} text="Delete" styles={{ root: { backgroundColor: '#dc3545' } }} />
                    <DefaultButton onClick={() => setIsDeleteDialogOpen(false)} text="Cancel" />
                </DialogFooter>
            </Dialog>
        </div>


    );
}




