// Supabaseの接続設定
const SUPABASE_URL = 'https://mxvumshakgwxuxyhpcgo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dnVtc2hha2d3eHV4eWhwY2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxODUyODYsImV4cCI6MjA4Mjc2MTI4Nn0.YTXMP1HURsiYgwluXjajL38s0y5vYh8TbPPpnlXiHbY';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * 1. リスト表示処理 (共通化)
 */
const appendToList = (orderNumber, savedId) => {
    const list = document.getElementById('completed-list');
    const li = document.createElement('li');
    const p = document.createElement('p');
    const doneButton = document.createElement('button');

    p.innerText = orderNumber;
    doneButton.innerText = '受渡済';

    // 削除処理（Supabaseと連携）
    doneButton.addEventListener('click', async () => {
        const { error: deleteError } = await supabaseClient
            .from('orders')
            .delete()
            .eq('id', savedId);

        if (!deleteError) {
            li.remove();
        } else {
            alert('削除に失敗しました');
        }
    });

    li.appendChild(p);
    li.appendChild(doneButton);
    list.appendChild(li);
};

/**
 * 2. 画面読み込み時の復元処理
 */
const initInputPage = async () => {
    const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('初期データ取得失敗:', error);
        return;
    }

    data.forEach(order => {
        appendToList(order.order_number, order.id);
    });
};

/**
 * 3. 画面表示の更新 (1文字追加)
 */
const updateDisplay = (val) => {
    const display = document.getElementById('display');
    display.innerText += val;
};

/**
 * 4. 1文字削除
 */
const onClickDelete = () => {
    const display = document.getElementById('display');
    const currentText = display.innerText;
    if (currentText.length > 0) {
        display.innerText = currentText.slice(0, -1);
    }
};

/**
 * 5. 送信処理 (OKボタン)
 */
const onClickSubmit = async () => {
    const display = document.getElementById('display');
    const orderNumber = display.innerText;

    if (orderNumber === '') return;

    // Supabaseに保存して生成されたIDを取得
    const { data, error } = await supabaseClient
        .from('orders')
        .insert([{ order_number: orderNumber, status: 'waiting' }])
        .select();

    if (!error && data.length > 0) {
        appendToList(data[0].order_number, data[0].id);
        display.innerText = '';
    } else {
        console.error('送信エラー:', error);
    }
};

/**
 * 6. 数字・OKボタンの生成と初期化
 */
const initializeKeypad = () => {
    const buttonNames = ['M', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'OK'];
    const container = document.getElementById('input-button');

    container.innerHTML = ''; // 二重生成防止

    buttonNames.forEach((name) => {
        const button = document.createElement('button');
        button.innerText = name;

        // OKボタンか数字ボタンかでイベントを分ける
        if (name === 'OK') {
            button.id = 'submit'; // HTMLのIDと合わせる
            button.addEventListener('click', onClickSubmit);
        } else {
            button.addEventListener('click', () => updateDisplay(name));
        }

        container.appendChild(button);
    });
};

/**
 * 実行
 */
document.addEventListener('DOMContentLoaded', () => {
    initInputPage();      // データの復元
    initializeKeypad();   // ボタンの生成

    // 削除ボタン（Footer内）のイベント登録
    const deleteBtn = document.getElementById('delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', onClickDelete);
    }
});