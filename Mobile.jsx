import React, {useEffect, useState} from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabaseの接続設定
const SUPABASE_URL = 'https://mxvumshakgwxuxyhpcgo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dnVtc2hha2d3eHV4eWhwY2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxODUyODYsImV4cCI6MjA4Mjc2MTI4Nn0.YTXMP1HURsiYgwluXjajL38s0y5vYh8TbPPpnlXiHbY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


export const Mobile = () => {
    const [displayText, setDisplayText] = useState([])
    const [orders, setOrders] = useState([])

    //初期データ読み込み
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'waiting')
            .order('created_at', { ascending: true });

        if (error) {
            console.log('初期データ取得失敗:', error);
        } else {
            setOrders(data);
        }
    };

    // 数字・文字の入力
    const handleInput = (val) => {
        setDisplayText(prev => prev + val);
    };

    // 1文字削除
    const handleDelete = () => {
        setDisplayText(prev => prev.slice(0, -1));
    };

    // const onClickDelete = () => {
    //     setDisplayText(prev => prev.slice(0, -1));
    // };


    // 送信処理(OKボタン)
    const handleSubmit = async () => {
        if (displayText === '') {
            return;
        }

        const { data, error } = await supabase
            .from('orders')
            .insert([{ order_number: displayText, status: 'waiting' }])
            .select();

        if (!error && data) {
            setOrders(prev => [...prev, data[0]]);
            setDisplayText('');
        } else {
            console.error('送信エラー:', error);
        }
    };

    // 受取済(削除)処理
    const handleComplete = async (id) => {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (!error) {
            setOrders(prev => prev.filter(order => order.id !== id));
        } else {
            alert('削除に失敗しました');
        }
    }

    const keys = ['M', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/*画面左側*/}
            <div className={"left-panel"}>
                <div className={"header"}>
                    <img src="https://emotion-tech.co.jp/wp-content/uploads/2023/06/gongcha_logo_02.png" alt="ゴンチャ" />
                    <h1 className={"input-text"}>{displayText}</h1>
                </div>
                <div className={"main"}>
                    <div className={"order-number"}>
                        {keys.map(key => (
                            <button key={key} onClick={() => handleInput(key)}>{key}</button>
                        ))}
                        <button id="submit" onClick={handleSubmit}>OK</button>

                    </div>
                </div>
                <footer className={'footer-area'} style={{ marginTop: 'auto' }}>
                    <button id="delete" onClick={handleDelete}>削除</button>
                </footer>
            </div>

            {/*画面の右側*/}
            <div className={"complete-container"}>
                <h1>呼び出し中</h1>
                <ul id="completed-list" style={{ listStyle: 'none', padding: 0 }}>
                    {orders.map(order => (
                        <li key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '10px', borderBottom: '1px solid #ddd' }}>
                            <h2 style={{ fontSize: '3rem', margin: 0 }}>{order.order_number}</h2>
                            <button onClick={() => handleComplete(order.id)}>受渡済</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}