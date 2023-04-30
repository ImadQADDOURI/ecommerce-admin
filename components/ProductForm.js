import Layout from "@/components/Layout";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export default function ProductForm({
    _id,
    title:existingTitle,
    description:existingDescription,
    price:existingPrice,
    images,
    category:assignedCategory,
    properties:assignedProperties,
}){


    const [title,setTitle] = useState( existingTitle || '');
    const [description,setDescription] = useState(existingDescription || '');
    const [price,setPrice] = useState(existingPrice || '');
    const [goToProduct,setgoToProduct]  = useState(false);
    const [categories,setCategories] = useState([]);
    const [category,setCategory] = useState(assignedCategory || '');
    const [productProperties,setProductProperties] = useState(assignedProperties || {});

    const router = useRouter();

    useEffect(() => {
        axios.get('/api/categories').then(result => { setCategories(result.data) ;})
    },[]);

    async function saveProduct(e){

        e.preventDefault();
        const data = {title,description,price,category,properties:productProperties};

        if(_id){
            //update
            await axios.put('/api/products',{...data,_id});
            setgoToProduct(true);
            
        }
        else{
            //create
            
            await axios.post('/api/products',data);
            setgoToProduct(true);
        }
       

    }

    if(goToProduct){
        router.push('/products');
    }
  

    async function uploadImages(e) {
        

        const files = e.target?.files;
        if(files?.length > 0){
            const data = new FormData();
            for( const file of files){data.append('file',file);}

            const res =  await axios.post('/api/upload',data);

              // console.log(res.data);
           
        }
        
    };

    function setProductProp(propName,value) {
        setProductProperties(prev => {
          const newProductProps = {...prev};
          newProductProps[propName] = value;
          return newProductProps;
        });
      }

    const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({_id}) => _id === category);
    propertiesToFill.push(...catInfo.properties);
    while(catInfo?.parent?._id) {
      const parentCat = categories.find(({_id}) => _id === catInfo?.parent?._id);
      propertiesToFill.push(...parentCat.properties);
      catInfo = parentCat;
    }
  }
    

return(
 
    <form onSubmit={saveProduct}>

        
        <label>Product name</label>
        <input type="text" placeholder="product name" value={title}
         onChange={e => { setTitle(e.target.value);}}/>

        <label >Category</label>
        <select name="" id="" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Uncategorized</option>

            { categories.length > 0 &&
                categories.map(category => ( <option value={category._id}>{category.name}</option>     ))
            }
        </select>

<div className="flex gap-2">
        {propertiesToFill.length > 0 && propertiesToFill.map(p => (
          <div key={p.name} className="">
            <label>{p.name[0].toUpperCase()+p.name.substring(1)}</label>
            <div>
              <select value={productProperties[p.name]}
                      onChange={ev =>
                        setProductProp(p.name,ev.target.value)
                      }
              >
                {p.values.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
</div>

        <label>Photos</label>
        <div className="mb-2">

            <label className="w-24 h-24 text-center flex flex-col items-center justify-center text-sm gap-1 text-gray-500 rounded-lg bg-gray-200 ">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>

            <div>Upload</div>
             
             <input type="file" onChange={uploadImages} className="hidden"/>
            </label>

            {!images?.length && ( <div>No Photos in this Product</div> )}
        </div>

        <label>Description</label>
        <textarea placeholder="description " value={description}
         onChange={e => setDescription(e.target.value)}/>

        <label>Price (in USD)</label>
        <input type="number" placeholder="price" value={price}
         onChange={e => setPrice(e.target.value)}/>

        <button type="submit" className="btn-primary">Save</button>
        
    </form>

       

);
}