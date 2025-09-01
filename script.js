class EasyFilter {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stream = null;
        this.isScanning = false;
        this.recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]');
        
        this.initializeElements();
        this.bindEvents();
        this.loadRecentScans();
    }

    initializeElements() {
        this.startScanBtn = document.getElementById('startScan');
        this.stopScanBtn = document.getElementById('stopScan');
        this.resultSection = document.querySelector('.result-section');
        this.barcodeValue = document.getElementById('barcodeValue');
        this.usageDetails = document.getElementById('usageDetails');
        this.copyBarcodeBtn = document.getElementById('copyBarcode');
        this.manualBarcodeInput = document.getElementById('manualBarcode');
        this.searchBarcodeBtn = document.getElementById('searchBarcode');
        this.recentScansList = document.getElementById('recentScansList');
    }

    bindEvents() {
        this.startScanBtn.addEventListener('click', () => this.startScan());
        this.stopScanBtn.addEventListener('click', () => this.stopScan());
        this.copyBarcodeBtn.addEventListener('click', () => this.copyBarcode());
        this.searchBarcodeBtn.addEventListener('click', () => this.searchManualBarcode());
        this.manualBarcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchManualBarcode();
        });
    }

    async startScan() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            
            this.video.srcObject = this.stream;
            this.isScanning = true;
            
            this.startScanBtn.style.display = 'none';
            this.stopScanBtn.style.display = 'inline-flex';
            
            this.scanLoop();
            
            this.showMessage('카메라가 활성화되었습니다. 바코드를 프레임 안에 맞춰주세요.', 'success');
        } catch (error) {
            console.error('카메라 접근 오류:', error);
            this.showMessage('카메라에 접근할 수 없습니다. 카메라 권한을 확인해주세요.', 'error');
        }
    }

    stopScan() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.isScanning = false;
        this.startScanBtn.style.display = 'inline-flex';
        this.stopScanBtn.style.display = 'none';
        
        this.showMessage('스캔이 중지되었습니다.', 'success');
    }

    scanLoop() {
        if (!this.isScanning) return;

        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            this.canvas.height = this.video.videoHeight;
            this.canvas.width = this.video.videoWidth;
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
            
            if (code) {
                this.processBarcode(code.data);
                return;
            }
        }
        
        requestAnimationFrame(() => this.scanLoop());
    }

    processBarcode(barcodeData) {
        // 바코드 데이터 정리 (숫자만 추출)
        const cleanBarcode = barcodeData.replace(/[^0-9]/g, '');
        
        if (cleanBarcode.length < 8) {
            this.showMessage('유효하지 않은 바코드입니다. 다시 시도해주세요.', 'error');
            return;
        }

        this.stopScan();
        
        // 수동 입력란에도 바코드 번호 자동 입력
        this.manualBarcodeInput.value = cleanBarcode;
        
        // 자동으로 검색 실행
        this.displayResult(cleanBarcode);
        this.addToRecentScans(cleanBarcode);
        
        this.showMessage(`바코드 ${cleanBarcode}가 성공적으로 스캔되어 자동 검색되었습니다.`, 'success');
    }

    displayResult(barcode) {
        this.barcodeValue.textContent = barcode;
        this.resultSection.style.display = 'block';
        
        // 사용 안내 정보 생성
        const usageInfo = this.generateUsageInfo(barcode);
        this.usageDetails.innerHTML = usageInfo;
        
        // 결과 섹션으로 스크롤
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    generateUsageInfo(barcode) {
        // 특별한 쿠쿠 필터 번호 처리
        if (barcode === '8809841630962') {
            return `
                <p><strong>필터 사용 모델 : AAS, ABS, AHS</strong></p>
                <p><strong>부품명 : SVC_METAL-BLOCK20_FTASM_08_CP-ALL_KR</strong></p>
                <p><strong>부품넘버 : 10420-0191J0</strong></p>
                <div class="product-images">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/ea64591f-6f68-48ce-b318-5a748fac7d20.jpg" alt="쿠쿠 필터 이미지 1" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/5079ad3c-7fe5-4280-b654-edfb6e1c13a7.jpg" alt="쿠쿠 필터 이미지 2" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/7a5e10c7-d312-408c-b6ee-a1bf30b2e87d.jpg" alt="쿠쿠 필터 이미지 3" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                </div>
            `;
        }
        
        if (barcode === '8809591513836') {
            return `
                <p><strong>필터 사용 모델 : AAS, ABS, AHS</strong></p>
                <p><strong>부품명 : SVC_NANOPOSITIVEPLUS30_FTASM_08_CP-ALL_KR</strong></p>
                <p><strong>부품넘버 : Z0420-0210U0</strong></p>
                <div class="product-images">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/ea64591f-6f68-48ce-b318-5a748fac7d20.jpg" alt="쿠쿠 필터 이미지 1" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/5079ad3c-7fe5-4280-b654-edfb6e1c13a7.jpg" alt="쿠쿠 필터 이미지 2" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/7a5e10c7-d312-408c-b6ee-a1bf30b2e87d.jpg" alt="쿠쿠 필터 이미지 3" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                </div>
            `;
        }
        
        if (barcode === '8809591517872') {
            return `
                <p><strong>필터 사용 모델 : M, U, AK, SS100(일부)</strong></p>
                <p><strong>부품명 : SVC_DS-CARBON-COMPOSITE_FTASM_08_CP-ALL_KR</strong></p>
                <p><strong>부품넘버 : 00420-0367S0</strong></p>
                <div class="product-images">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/b0ca930a-dc26-4f85-bf67-af9827d0b005.jpg" alt="쿠쿠 필터 이미지 1" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/38fe1de0-7052-4247-be77-60a53f51e7a1.jpg" alt="쿠쿠 필터 이미지 2" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/9cc1372f-ccf0-4036-89a2-9a5794de8553.jpg" alt="쿠쿠 필터 이미지 3" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                </div>
                <p style="color: #6c757d; font-size: 0.9em; margin-top: 10px;"><i class="fas fa-info-circle"></i> M 모델 사진은 제공되지 않습니다.</p>
            `;
        }
        
        if (barcode === '8809591519135') {
            return `
                <p><strong>필터 사용 모델 : M, U, AK, SS100(일부)</strong></p>
                <p><strong>부품명 : SVC_NATURALPLUS20_FTASM_08_CP-ALL_KR</strong></p>
                <p><strong>부품넘버 : 00420-0383Y0</strong></p>
                <div class="product-images">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/b0ca930a-dc26-4f85-bf67-af9827d0b005.jpg" alt="쿠쿠 필터 이미지 1" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/38fe1de0-7052-4247-be77-60a53f51e7a1.jpg" alt="쿠쿠 필터 이미지 2" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/9cc1372f-ccf0-4036-89a2-9a5794de8553.jpg" alt="쿠쿠 필터 이미지 3" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                </div>
                <p style="color: #6c757d; font-size: 0.9em; margin-top: 10px;"><i class="fas fa-info-circle"></i> M 모델 사진은 제공되지 않습니다.</p>
            `;
        }
        
        if (barcode === '8809591519128') {
            return `
                <p><strong>필터 사용 모델 : M, U, AK, SS100(일부)</strong></p>
                <p><strong>부품명 : SVC_NANOPOSITIVE30C_FTASM_08_3FILTER_KR</strong></p>
                <p><strong>부품넘버 : Z0420-0209C2</strong></p>
                <div class="product-images">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/b0ca930a-dc26-4f85-bf67-af9827d0b005.jpg" alt="쿠쿠 필터 이미지 1" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/38fe1de0-7052-4247-be77-60a53f51e7a1.jpg" alt="쿠쿠 필터 이미지 2" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/9cc1372f-ccf0-4036-89a2-9a5794de8553.jpg" alt="쿠쿠 필터 이미지 3" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                </div>
                <p style="color: #6c757d; font-size: 0.9em; margin-top: 10px;"><i class="fas fa-info-circle"></i> M 모델 사진은 제공되지 않습니다.</p>
            `;
        }
        
        if (barcode === '8809591514628') {
            return `
                <p><strong>필터 사용 모델 : TS, SS(일부)</strong></p>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #007bff; margin-bottom: 10px;">버전 1</h4>
                    <p><strong>부품명 : SVC_CARBON-COMPOSITE_FTASM_08_130,HAYCABB_CP-ALL_KR</strong></p>
                    <p><strong>부품넘버 : 10420-0043A1</strong></p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #28a745; margin-bottom: 10px;">버전 2</h4>
                    <p><strong>부품명 : SVC_CARBON-COMPOSITE_FTASM_08_50,130,HAYCABB_CP-ALL_KR</strong></p>
                    <p><strong>부품넘버 : 10420-0043C1</strong></p>
                </div>
                
                <div class="product-images">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/553f469b-11da-4aa7-81c8-368da7c365f9.jpg" alt="쿠쿠 필터 이미지 1" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="https://cdn.cuckoo.co.kr/upload_cuckoo/_bo_rental/product/b0ca930a-dc26-4f85-bf67-af9827d0b005.jpg" alt="쿠쿠 필터 이미지 2" style="max-width: 200px; height: auto; margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                </div>
            `;
        }
        
        // 바코드 패턴에 따른 사용 안내 생성
        const barcodeLength = barcode.length;
        const firstDigit = barcode.charAt(0);
        
        let usageInfo = '';
        
        if (barcodeLength === 13) {
            // EAN-13 바코드
            if (firstDigit === '8') {
                usageInfo = `
                    <p><strong>제품 정보:</strong> 국내 상품 (EAN-13)</p>
                    <p><strong>사용 분야:</strong></p>
                    <ul>
                        <li>소매점 상품 관리</li>
                        <li>재고 관리 시스템</li>
                        <li>POS 시스템</li>
                        <li>온라인 쇼핑몰</li>
                    </ul>
                    <p><strong>확인 방법:</strong> 제품 포장지나 라벨에서 바코드 번호를 확인할 수 있습니다.</p>
                `;
            } else if (firstDigit === '9') {
                usageInfo = `
                    <p><strong>제품 정보:</strong> 국제 상품 (EAN-13)</p>
                    <p><strong>사용 분야:</strong></p>
                    <ul>
                        <li>국제 무역</li>
                        <li>해외 상품 관리</li>
                        <li>통관 시스템</li>
                        <li>글로벌 유통</li>
                    </ul>
                    <p><strong>확인 방법:</strong> 제품의 원산지 표시와 함께 확인하세요.</p>
                `;
            } else {
                usageInfo = `
                    <p><strong>제품 정보:</strong> 일반 상품 (EAN-13)</p>
                    <p><strong>사용 분야:</strong></p>
                    <ul>
                        <li>일반 소매점</li>
                        <li>대형마트</li>
                        <li>편의점</li>
                        <li>온라인 쇼핑</li>
                    </ul>
                    <p><strong>확인 방법:</strong> 제품 포장지의 바코드를 스캔하거나 수동으로 입력하세요.</p>
                `;
            }
        } else if (barcodeLength === 12) {
            // UPC-A 바코드
            usageInfo = `
                <p><strong>제품 정보:</strong> 미국 표준 상품 (UPC-A)</p>
                <p><strong>사용 분야:</strong></p>
                <ul>
                    <li>미국 시장 상품</li>
                    <li>북미 지역 유통</li>
                    <li>해외 직구 상품</li>
                    <li>국제 상품 관리</li>
                </ul>
                <p><strong>확인 방법:</strong> 미국에서 제조된 상품의 경우 주로 사용됩니다.</p>
            `;
        } else if (barcodeLength === 8) {
            // EAN-8 바코드
            usageInfo = `
                <p><strong>제품 정보:</strong> 소형 상품 (EAN-8)</p>
                <p><strong>사용 분야:</strong></p>
                <ul>
                    <li>작은 포장 상품</li>
                    <li>편의점 상품</li>
                    <li>자판기 상품</li>
                    <li>소형 제품 관리</li>
                </ul>
                <p><strong>확인 방법:</strong> 작은 제품의 경우 공간 제약으로 짧은 바코드를 사용합니다.</p>
            `;
        } else {
            // 기타 바코드
            usageInfo = `
                <p><strong>제품 정보:</strong> 특수 바코드 (${barcodeLength}자리)</p>
                <p><strong>사용 분야:</strong></p>
                <ul>
                    <li>내부 관리 시스템</li>
                    <li>특수 용도 상품</li>
                    <li>기업 내부 코드</li>
                    <li>맞춤형 관리 시스템</li>
                </ul>
                <p><strong>확인 방법:</strong> 해당 기업이나 조직의 내부 시스템을 확인하세요.</p>
            `;
        }
        
        return usageInfo;
    }

    searchManualBarcode() {
        const barcode = this.manualBarcodeInput.value.trim();
        
        if (!barcode) {
            this.showMessage('바코드 번호를 입력해주세요.', 'error');
            return;
        }
        
        if (barcode.length < 8) {
            this.showMessage('유효한 바코드 번호를 입력해주세요. (최소 8자리)', 'error');
            return;
        }
        
        this.displayResult(barcode);
        this.addToRecentScans(barcode);
        this.manualBarcodeInput.value = '';
    }

    copyBarcode() {
        const barcode = this.barcodeValue.textContent;
        navigator.clipboard.writeText(barcode).then(() => {
            this.showMessage('바코드 번호가 클립보드에 복사되었습니다.', 'success');
        }).catch(() => {
            this.showMessage('클립보드 복사에 실패했습니다.', 'error');
        });
    }

    addToRecentScans(barcode) {
        const scanRecord = {
            barcode: barcode,
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleString('ko-KR')
        };
        
        // 중복 제거
        this.recentScans = this.recentScans.filter(scan => scan.barcode !== barcode);
        
        // 최신 기록을 맨 앞에 추가
        this.recentScans.unshift(scanRecord);
        
        // 최대 10개까지만 저장
        if (this.recentScans.length > 10) {
            this.recentScans = this.recentScans.slice(0, 10);
        }
        
        localStorage.setItem('recentScans', JSON.stringify(this.recentScans));
        this.loadRecentScans();
    }

    loadRecentScans() {
        if (this.recentScans.length === 0) {
            this.recentScansList.innerHTML = '<p style="text-align: center; color: #6c757d;">최근 스캔 기록이 없습니다.</p>';
            return;
        }
        
        this.recentScansList.innerHTML = this.recentScans.map(scan => `
            <div class="recent-item" onclick="easyFilter.selectRecentScan('${scan.barcode}')">
                <span class="recent-barcode">${scan.barcode}</span>
                <span class="recent-time">${scan.time}</span>
            </div>
        `).join('');
    }

    selectRecentScan(barcode) {
        this.displayResult(barcode);
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    showMessage(message, type) {
        // 기존 메시지 제거
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        // 메시지를 페이지 상단에 추가
        const container = document.querySelector('.container');
        container.insertBefore(messageElement, container.firstChild);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 3000);
    }
}

// 앱 초기화
let easyFilter;
document.addEventListener('DOMContentLoaded', () => {
    easyFilter = new EasyFilter();
});

// 전역 함수로 노출 (최근 스캔 클릭용)
window.easyFilter = null;
document.addEventListener('DOMContentLoaded', () => {
    window.easyFilter = easyFilter;
}); 