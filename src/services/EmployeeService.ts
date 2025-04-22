import { IEmployee } from "../Models/IEmployee";
import { getSp } from "../Models/spSetup";


export async function addEmployee(employee: Omit<IEmployee, "Id" | "ProfilePictureUrl">, file : File){
    const sp = getSp();

            // Upload image to SiteAssets
            const uploadResult = await sp.web.getFolderByServerRelativePath("SiteAssets")
                .files.addUsingPath(file.name, file, { Overwrite: true })

                console.log(uploadResult)
            // const absoluteUrl = await sp.web.select("Url")().then(w => w.Url);
            // console.log(absoluteUrl)
            //     const siteUrl = 'https://quadintelligence.sharepoint.com'
            //   const imageUrl =`${siteUrl}${uploadResult.ServerRelativeUrl}` ;
            console.log(uploadResult)
                 // Add item to the SharePoint list
                 await sp.web.lists.getByTitle("EmpList").items.add({
                    Title: employee.Title,
                    JobTitle: employee.JobTitle,
                    Department: employee.Department,
                    Email: employee.Email,
                    ProfilePictureUrl: JSON.stringify({
                        fileName: file.name,
                        serverRelativeUrl: uploadResult.ServerRelativeUrl
                    })
    
                });
}


export async function updateEmployee(id: number, employee: Omit<IEmployee, "Id" | "ProfilePictureUrl">, file?: File, existingProfilePictureUrl?: string) {

    const sp = getSp()
    let profilePictureData = { fileName: '', serverRelativeUrl: '' };
  
    if (file) {
      const uploadResult = await sp.web.getFolderByServerRelativePath("SiteAssets")
        .files.addUsingPath(file.name, file, { Overwrite: true });
        
        const url = JSON.parse(existingProfilePictureUrl!).serverRelativeUrl
         await sp.web.getFolderByServerRelativePath(url).delete()

      profilePictureData = {
        fileName: file.name,
        serverRelativeUrl: uploadResult.ServerRelativeUrl,
      };
    } else if (existingProfilePictureUrl) {
      profilePictureData = JSON.parse(existingProfilePictureUrl);
    }
  
    return await sp.web.lists.getByTitle("EmpList").items.getById(id).update({
      Title: employee.Title,
      JobTitle: employee.JobTitle,
      Department: employee.Department,
      Email: employee.Email,
      ProfilePictureUrl: JSON.stringify(profilePictureData),
    });
}

export async function deleteEmployee(id: number, profilePictureUrl?: string){

    const sp = getSp();
    await sp.web.lists.getByTitle("EmpList").items.getById(id).delete();
    try {
        const profileData = JSON.parse(profilePictureUrl!);
        const filePath = profileData?.serverRelativeUrl;

        if (filePath) {
            await sp.web.getFileByServerRelativePath(filePath).delete();
        }
    } catch (err) {
        console.error("Error deleting the image:", err);
    }


}
