import { useState } from 'react';
import { Button } from '@/components/ui/button';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className='w-[200px] h-[200px] bg-black flex items-center justify-center flex-col gap-5 rounded-lg'>
      <div className='bg-red-500 text-4xl'>Hello developer</div>
      <Button onClick={() => setCount(count + 1)}>Count : {count}</Button>
    </div>
  );
}

export default App;
